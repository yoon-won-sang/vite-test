echart legend click 시 내부동작 설명해줘


 ECharts Legend Click 내부 동작

 ### 1. 사용자 클릭 → legendSelectChanged 이벤트 발생

 ```
사용자가 "Series A" 레전드 클릭
  → chart.dispatchAction({ type: 'legendToggleSelect', name: 'Series A' })
  → 내부 상태 변경
 ```

 ### 2. 내부 상태 변경 (core model)

 ```
selectedMap: { 'Series A': true }  →  { 'Series A': false }
                         ↑
              legendToggleSelect = 현재값 반전
 ```

 ### 3. setOption 재호출 (notMerge: false 기본)

 ECharts가 내부적으로 현재 option을 가져와 selectedMap만 수정 후 재병합:

 ```
기존 series[0] → selected: true  →  selected: false
기존 series[1] → selected: true  →  selected: true  (유지)
 ```

 ### 4. Painter가 시리즈 숨김 처리

 ```
if (series.selected === false) {
  seriesGroup.visible = false
  seriesGroup.hide()  // display:none 이 아님, opacity=0 또는 clipPath
}
 ```

 여기서 잔상 발생 지점:

 ┌────────────────┬────────────────────────────────┬─────────────────────────────────────────────┐
 │ 단계           │ 내부 동작                      │ 잔상 원인                                   │
 ├────────────────┼────────────────────────────────┼─────────────────────────────────────────────┤
 │ hide()         │ opacity=0 또는 clipPath로 가림 │ opacity=0이면 이전 프레임이 GPU 버퍼에 남음 │
 ├────────────────┼────────────────────────────────┼─────────────────────────────────────────────┤
 │ 리렌더링       │ series.renderItem() 재실행     │ 이전 path가 회색/반투명残留                 │
 ├────────────────┼────────────────────────────────┼─────────────────────────────────────────────┤
 │ notMerge: true │ 이전 series 전체 교체          │ graphic 객체가 완전히 dispose되지 않음      │
 └────────────────┴────────────────────────────────┴─────────────────────────────────────────────┘

 ### 5. 잔상이 남는 핵심 원인

 ECharts의 legend toggle은 데이터를 지우는 게 아니라 visible=false 처리입니다.

 ```
hide() 호출 시:
  - SVG/Canvas renderer: 요소는 DOM에 존재, 시각적 가시성만 off
  - Canvas renderer: clear() 안 함 → 이전 픽셀 버퍼 유지
  - WebGL renderer: drawcall은 skip되지만 프레임버퍼 clear 안 됨
 ```

 ### 6. 잔상 방지 코드

 ```ts
// Legend 토글 후 완전한 리렌더 트리거
chart.on('legendselectchanged', (params) => {
  const option = chart.getOption()

  // 1. selectedMap 반영된 series를 가져옴
  const series = option.series

  // 2. clear()로 이전 렌더 버퍼 강제 비우기
  chart.clear()

  // 3. 전체 옵션을 다시 적용 (graphic 레이어 완전 교체)
  chart.setOption(
    { series },
    { notMerge: true, lazyUpdate: false }
  )
})
 ```

 ### 요약 플로우

 ```
Click → legendToggleSelect → selectedMap 반전 → setOption(재병합)
      → painter.hide() (opacity=0) → 이전 프레임 잔상

해결: clear() + setOption(notMerge:true) 로 graphic 레이어 완전 교체
