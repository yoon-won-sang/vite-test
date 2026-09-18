import { create } from 'zustand'
import type { ComponentType, ReactNode } from 'react'

/* ================================================================
 * zustand 모달 스토어
 *
 * ⚠️ openModal(<ReactNode />) 방식은 동기화가 안 됩니다.
 *   - React 엘리먼트는 생성 시점의 props를 "값"으로 간주 → immutability
 *   - zustand는 === 비교로 상태 변화를 인식 → 동일한 엘리먼트는 "변경 없음"
 *   - 결과: 부모 state 변경 시 팝업이 리렌더되지 않음
 *
 * ✅ 올바른 방식: 컴포넌트 타입 + props 를 스토어에 저장.
 *   - props는 값(동적), Component는 타입(정적) → 구독 체계 유지
 *   - ModalRoot 가 매 렌더마다 <Component {...props} /> 로 fresh 렌더링
 * ================================================================ */

interface ModalItem {
  id: string
  Component: ComponentType<any>
  props: Record<string, any>
  title?: string
  width?: number | string
}

interface ModalState {
  modals: ModalItem[]

  openModal: (Comp: ComponentType<any>, opts?: { title?: string; width?: number | string; props?: Record<string, any> }) => string
  updateModalProps: (id: string, newProps: Record<string, any>) => void
  closeModal: (id: string) => void
  clearModal: () => void
}

export const useModalStore = create<ModalState>()((set, get) => ({
  modals: [],

  openModal: (Comp, opts = {}) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({
      modals: [
        ...state.modals,
        {
          id,
          Component: Comp,
          props: opts.props ?? {},
          title: opts.title,
          width: opts.width,
        },
      ],
    }))
    return id
  },

  updateModalProps: (id, newProps) =>
    set((state) => ({
      modals: state.modals.map((m) =>
        m.id === id ? { ...m, props: { ...m.props, ...newProps } } : m
      ),
    })),

  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    })),

  clearModal: () => set({ modals: [] }),
}))