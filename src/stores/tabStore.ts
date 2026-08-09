import { create } from 'zustand'

// ------------------------------------------------------------------
// 탭(ChartTabExample) 전용 zustand 스토어
//
// 핵심 아이디어
// - "탭 활성화(activeUuid)" 와 "refetch 의도(pendingRefetchUuid)" 를 분리한다.
//   - 탭 클릭          → activeUuid 만 변경  → refetch 의도 없음
//   - 탭 A의 버튼       → navigateWithRefetch → activeUuid + pendingRefetchUuid 함께 변경
// - 대상 탭(B)은 스스로 store 를 구독해서
//   "pendingRefetchUuid === 내 id && activeUuid === 내 id" 일 때만 refetch 하고,
//   그 후 일회성 신호를 소비(consumePendingRefetch) 한다.
//
// 이렇게 하면 부모가 chartRefs Map 으로 일일이 접근할 필요가 없어진다.
// ------------------------------------------------------------------

// 탭이 가질 수 있는 종류
export type ChartTabKind = 'line' | 'chart'

export interface ChartTab {
  // 탭을 식별하는 uuid
  key: string
  label: string
  kind: ChartTabKind
}

// 탭 A (SimpleLineChart 가 들어있는 탭) / 탭 B (MyChart 고정 탭)
export const LINE_UUID = 'tab-a-line'
export const RESIZE_UUID = 'tab-b-static'

let dynamicSeq = 1
const makeUuid = (): string => `dynamic-${Date.now().toString(36)}-${dynamicSeq++}`

interface TabState {
  // 자식 탭 목록 (zustand 가 소유)
  tabs: ChartTab[]
  // 현재 활성 탭 uuid (부모 Tabs 의 activeKey 에 연결)
  activeUuid: string | null
  // "이 uuid 탭을 refetch 하라"는 일회성 명령 (탭 A 버튼에서만 세팅)
  pendingRefetchUuid: string | null

  // 일반 탭 클릭(onChange): 활성 탭만 바꾸고, refetch 의도는 만들지 않는다
  setActiveByTabClick: (uuid: string) => void
  // 탭 A의 버튼: 활성 탭으로 이동 + refetch 의도 표시
  navigateWithRefetch: (uuid: string) => void
  // 새 MyChart 탭(B) 을 동적으로 추가하고, 그 uuid 를 반환
  addChartTab: (label?: string) => string
  // 대상 탭이 refetch 를 마친 뒤 일회성 신호를 소비
  consumePendingRefetch: (uuid: string) => void
}

export const useTabStore = create<TabState>()((set, get) => ({
  tabs: [
    { key: LINE_UUID, label: '라인차트 (SimpleLineChart)', kind: 'line' },
    { key: RESIZE_UUID, label: '리사이즈 처리 차트 (B)', kind: 'chart' },
  ],
  activeUuid: LINE_UUID,
  pendingRefetchUuid: null,

  // 탭 클릭: 이동만 한다 (refetch 의도 없음 → B 에서 refetch 안 일어남)
  setActiveByTabClick: (uuid) => set({ activeUuid: uuid }),

  // 탭 A 버튼: 이동과 동시에 refetch 의도를 표시
  navigateWithRefetch: (uuid) =>
    set({ activeUuid: uuid, pendingRefetchUuid: uuid }),

  // 새 MyChart 탭 추가 (uuid 는 store 가 발급)
  addChartTab: (label) => {
    const uuid = makeUuid()
    const resolved = label ?? `MyChart ${get().tabs.length + 1}`
    set((s) => ({ tabs: [...s.tabs, { key: uuid, label: resolved, kind: 'chart' }] }))
    return uuid
  },

  // 대상 탭이 refetch 를 끝냈으면 신호 초기화 → 다음엔 재실행되지 않는다
  consumePendingRefetch: (uuid) =>
    set((s) => (s.pendingRefetchUuid === uuid ? { pendingRefetchUuid: null } : {})),
}))
