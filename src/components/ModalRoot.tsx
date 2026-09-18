import React, { useEffect } from 'react'
import { Modal } from 'antd'
import { useModalStore } from '../stores/modalStore'

/**
 * ⭐ zustand 모달 렌더러.
 *
 * 앱의 한 곳(보통 App.tsx 루트)에 <ModalRoot /> 를 배치하면,
 * 스토어에 Component/props/open 이 설정될 때마다 자동으로 모달을 렌더링한다.
 *
 * 왜 이 방법인가?
 * - props는 "값"이므로 부모 state 변경 시 최신 값으로 갱신된다.
 * - Component는 "타입"이므로 정적이다.
 * - 매 렌더마다 <Component {...props} /> 를 fresh 렌더링 → 부모 state와 동기화.
 */
export const ModalRoot: React.FC = () => {
  const modals = useModalStore((s) => s.modals)
  const closeModal = useModalStore((s) => s.closeModal)

  return (
    <>
      {modals.map((m) => (
        <Modal
          key={m.id}
          title={m.title}
          open={true}
          onCancel={() => closeModal(m.id)}
          onOk={() => closeModal(m.id)}
          width={m.width ?? 640}
          maskClosable
          keyboard
        >
          <m.Component {...m.props} />
        </Modal>
      ))}
    </>
  )
}

export default ModalRoot