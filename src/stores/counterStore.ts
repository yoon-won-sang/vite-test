import { create } from 'zustand'

// ---------------------------------------------------------------
// zustand 기본 예제: 전역 카운터 스토어
// - create<타입>()((set, get) => ({ ... })) 형태로 스토어를 만든다.
// - set()은 상태를 바꾸고, get()은 현재 스토어의 값을 읽어온다.
// - 이 스토어는 여러 컴포넌트가 같은 상태를 공유하도록 도와준다.
// ---------------------------------------------------------------

interface CounterState {
  // 현재 카운터의 값
  count: number
  // 최근 동작 기록을 저장하는 배열
  history: string[]
  // 숫자를 증가시키는 함수
  increase: (by?: number) => void
  // 숫자를 감소시키는 함수
  decrease: (by?: number) => void
  // 카운터를 초기값으로 되돌리는 함수
  reset: () => void
  // 히스토리에 메시지를 추가하는 함수
  addLog: (msg: string) => void
}

export const useCounterStore = create<CounterState>()((set, get) => ({
  // 초기 카운터 값은 0부터 시작한다.
  count: 0,

  // 상태 변경 내역을 저장하는 배열이다.
  // 다른 컴포넌트와 공유되는 전역 상태이므로, 여기 기록을 남겨 추적할 수 있다.
  history: [],

  increase: (by = 1) => {
    // set() 안에서 이전 상태를 기준으로 새로운 값을 계산한다.
    set((state) => ({ count: state.count + by }))

    // 증가한 내용을 기록한다.
    // get().count를 사용하면 현재 스토어의 최신 값에 바로 접근할 수 있다.
    get().addLog(`+${by}  (현재 ${get().count})`)
  },

  decrease: (by = 1) => {
    // 감소도 동일하게 이전 상태를 기준으로 계산한다.
    set((state) => ({ count: state.count - by }))
    get().addLog(`-${by}  (현재 ${get().count})`)
  },

  reset: () => {
    // 카운터만 0으로 초기화하고, 기록은 따로 남긴다.
    set({ count: 0 })
    get().addLog('reset  (현재 0)')
  },

  addLog: (msg) => {
    // history가 너무 길어지지 않도록 최근 5개만 유지한다.
    // slice(-4)로 마지막 4개를 남기고 새 메시지를 추가해 총 5개를 유지한다.
    set((state) => ({ history: [...state.history.slice(-4), msg] }))
  },
}))
