import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Button, Divider, Modal, Space, Tag, Typography, message } from 'antd'
import { LoginOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

/* ================================================================
 * 설정값 (실제 운영에서는 환경변수로 주입)
 * ================================================================ */

/**
 * 타 도메인의 홈(팝업) URL. 이 페이지가 SSO 로그인을 수행하고,
 * 로그인 성공 후에도 <b>자기 자신의 본 페이지를 보여주며 열린 채 유지</b>된다.
 * (부모로 리다이렉트되지 않음)
 */
const SSO_LOGIN_URL = 'https://other-domain.example.com/'

/**
 * ⭐⭐⭐ 부모 백엔드의 '세션 확인' API.
 * 팝업이 타 도메인에 머물러 있으므로 iframe 을 직접 읽을 수 없고,
 * 토큰도 URL 로 받을 수 없다. 대신 <b>공유 세션(쿠키)</b>을 통해 판단한다.
 * SSO 로그인이 공유 세션을 만들면, 부모의 이 API 가 인증 여부를 알려준다.
 */
const SESSION_CHECK_URL = '/api/auth/whoami'

/** 세션 폴링 주기(ms) */
const POLL_INTERVAL_MS = 1500

/** 세션 확인 결과 */
interface Session {
  authenticated: boolean
  token?: string
  reason?: string
}

/* ================================================================
 * 세션 확인 (실제/시뮬 공용)
 * ================================================================ */

/**
 * 실제 운영에서는 부모 백엔드의 세션 확인 API 를 호출한다.
 * - 서버가 공유 SSO 세션 쿠키를 검증해 인증 여부를 반환한다고 가정.
 * - `credentials: 'include'` 로 쿠키를 함께 보낸다.
 *
 * 시뮬레이션에서는 same-origin(srcdoc) 시뮬레이션에서 로그인 버튼이 심은
 * `sso_token` 쿠키를 읽어 '공유 세션'을 흉내 낸다.
 */
async function checkSession(mode: 'real' | 'sim'): Promise<Session> {
  if (mode === 'sim') {
    // srcdoc 로그인 페이지가 부모 오리진에 심은 쿠키를 읽는다 (공유 세션 시뮬레이션)
    const match = document.cookie.match(/(?:^|;\s*)sso_token=([^;]+)/)
    if (match) return { authenticated: true, token: decodeURIComponent(match[1]) }
    return { authenticated: false, reason: '아직 세션 없음' }
  }

  // 실제 운영 코드 (주석 해제 후 사용):
  // const res = await fetch(SESSION_CHECK_URL, {
  //   method: 'GET',
  //   credentials: 'include', // 쿠키(세션) 전송
  //   headers: { Accept: 'application/json' },
  // })
  // if (!res.ok) return { authenticated: false, reason: `HTTP ${res.status}` }
  // const data = (await res.json()) as { authenticated: boolean; token?: string }
  // return data
  return { authenticated: false, reason: `운영 API 미연동 (${SESSION_CHECK_URL})` }
}


/* ================================================================
 * 시뮬레이션용 팝업 HTML (srcdoc)
 * - "타 도메인의 본 페이지"를 흉내 낸다.
 * - 로그인 버튼: 공유 세션 쿠키(sso_token)를 심고, 본 페이지 UI 를 그대로 보여준다
 *   (부모로 리다이렉트 없이 열린 채 유지됨).
 * ================================================================ */
const SIM_POPUP_SRCDOC = `
<!doctype html>
<html>
  <body style="font-family:sans-serif;padding:24px;background:#e6fffb">
    <h2>🏠 타 도메인 본 페이지 (수정 불가)</h2>
    <p>이 페이지가 SSO 로그인을 수행하며, 로그인 후에도 <b>이 화면(자기 홈)을 유지</b>한다.</p>
    <button onclick="doLogin()" style="padding:10px 20px;font-size:16px;margin-bottom:12px">로그인(SSO)</button>
    <div id="home" style="display:none;border:1px solid #91caff;padding:12px;border-radius:8px">
      ✅ 로그인됨 — 타 도메인 본 페이지 그대로 표시 중<br/>
      (부모로 리다이렉트 없음, 팝업 유지)
    </div>
    <script>
      function doLogin() {
        // 실제 SSO 는 공유 세션(쿠키)을 만든다.
        // 시뮬레이션: 부모 오리진(srcdoc 상속)에 세션 쿠키를 심어 '공유 세션'을 재현.
        document.cookie = 'sso_token=fake-token-12345; path=/';
        document.getElementById('home').style.display = 'block';
      }
    </script>
  </body>
</html>
`


/* ================================================================
 * 컴포넌트
 * ================================================================ */

/**
 * 크로스 도메인 iframe SSO 팝업 — "팝업이 열린 채 유지"되는 시나리오
 *
 * 문제:  부모가 타 도메인 iframe 팝업을 띄우고, 그 안에서 SSO 로그인이 일어난다.
 *        로그인 후 팝업은 <b>타 도메인 본 페이지를 보여주며 열린 채 유지</b>된다.
 *        팝업은 수정 불가(→ postMessage 불가), 크로스오리진(→ iframe 내부 읽기 불가),
 *        부모로 리다이렉트 없음(→ 콜백 URL 로 토큰 수신 불가).
 *
 * 해결:  iframe 을 읽으려 하지 않는다. <b>공유 세션(쿠키)을 통해 감지</b>한다.
 *        1) SSO 로그인이 '공유 세션'을 만든다 (전제 조건)
 *        2) 부모는 주기적으로 자기 백엔드 세션 확인 API 를 폴링한다
 *        3) 인증되면 → 로그인 성공 처리. 팝업은 원하는 대로 열어둔다
 */
const SsoIframePopup: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'checking' | 'authed'>('idle')
  const [polls, setPolls] = useState(0)
  const [mode, setMode] = useState<'real' | 'sim'>('sim')

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const pollTimerRef = useRef<number | null>(null)

  /* ---- 세션 폴링 (팝업을 읽지 않고 공유 세션만 확인) ---- */
  const startPolling = useCallback(() => {
    if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current)

    setStatus('checking')
    setPolls(0)

    // setTimeout 재귀로 일정 간격 폴링. 인증되면 스스로 중단된다.
    const tick = async () => {
      const session = await checkSession(mode)
      setPolls((p) => p + 1)

      if (!session.authenticated) {
        // 아직 인증 안 됨 → 다음 주기에 다시 확인
        pollTimerRef.current = window.setTimeout(
          () => void tick(),
          POLL_INTERVAL_MS,
        ) as unknown as number
        return
      }

      // ✅ 인증됨 → 폴링 종료 (팝업은 '열어둔 채 유지')
      pollTimerRef.current = null
      setToken(session.token ?? null)
      setStatus('authed')
      message.success('SSO 로그인 감지! 공유 세션에서 인증을 확인했습니다.')
    }

    void tick() // 즉시 1회 확인
  }, [mode])

  /* ---- 모달 닫히면 폴링 정리 ---- */
  useEffect(() => {
    if (!open && pollTimerRef.current) {
      window.clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [open])

  /* ---- 컴포넌트 언마운트 시 폴링 정리 ---- */
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current)
    }
  }, [])

  const openPopup = useCallback(() => {
    setToken(null)
    setStatus('idle')
    setPolls(0)
    setOpen(true)
    window.setTimeout(() => startPolling(), 600) // 팝업이 뜬 뒤 폴링 시작
  }, [startPolling])

  const switchMode = useCallback((next: 'real' | 'sim') => {
    setMode(next)
    setToken(null)
    setStatus('idle')
    setPolls(0)
  }, [])

  const authed = status === 'authed'

  return (
    <div className="card-section">
      <Title level={4} style={{ marginTop: 0 }}>
        🔐 타 도메인 iframe SSO 팝업 (팝업 유지형)
      </Title>
      <Paragraph type="secondary">
        타 도메인 <Tag>수정 불가</Tag> 팝업 안에서 SSO 로그인. 로그인 후 팝업은{' '}
        <b>자기 본 페이지를 보여주며 열린 채 유지</b>된다.
      </Paragraph>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="왜 이렇게 하나?"
        description={
          <>
            팝업이 부모로 리다이렉트되지 않고 타 도메인에 머물므로, <b>콜백 URL 로 토큰을
            받는 방식은 쓸 수 없다</b>. 또 수정 불가라 postMessage 도 불가능하다. 따라서{' '}
            <b>iframe 을 직접 읽지 않고 '공유 세션(쿠키)'을 통해 감지</b>한다 — 팝업의 SSO 로그인이
            공유 세션을 만들면, 부모가 주기적으로 자기 백엔드의 세션 확인 API 를 폴링하여 인증
            여부를 판단한다.
          </>
        }
      />

      <Space style={{ marginBottom: 16 }}>
        <Button type={mode === 'sim' ? 'primary' : 'default'} onClick={() => switchMode('sim')}>
          시뮬레이션
        </Button>
        <Button type={mode === 'real' ? 'primary' : 'default'} onClick={() => switchMode('real')}>
          실제 운영(Polling)
        </Button>
      </Space>

      <Divider style={{ margin: '8px 0 16px' }} />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Button type="primary" icon={<LoginOutlined />} onClick={openPopup}>
          타 도메인 팝업 열기
        </Button>

        {status === 'checking' && (
          <Alert
            type="info"
            showIcon
            message="세션 폴링 중..."
            description={
              <>
                {POLL_INTERVAL_MS / 1000}초 간격으로 세션 확인 API 를 조회 중
                ({polls}회). 팝업에서 로그인하면 자동 감지됩니다.
              </>
            }
          />
        )}

        {authed && (
          <Alert
            type="success"
            showIcon
            message="✅ 로그인 감지됨 (팝업은 열려 있음)"
            description={
              <Space direction="vertical" size={4}>
                <div>공유 세션으로부터 인증을 확인했습니다.</div>
                <div>
                  세션 토큰: <Text code>{token}</Text>
                </div>
                <div>
                  상태:
                  <Tag color="green">인증됨</Tag> 지금 원하는 대로 팝업을 닫거나 그대로 두세요.
                </div>
              </Space>
            }
          />
        )}
      </Space>

      <Modal
        title={`타 도메인 팝업 (${SSO_LOGIN_URL})`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={
          authed ? (
            <Button type="primary" onClick={() => setOpen(false)}>
              로그인 확인, 팝업 닫기
            </Button>
          ) : null
        }
        width={640}
        destroyOnClose
      >
        <iframe
          ref={iframeRef}
          title="other-domain-popup"
          src={mode === 'real' ? SSO_LOGIN_URL : undefined}
          srcDoc={mode === 'sim' ? SIM_POPUP_SRCDOC : undefined}
          style={{ width: '100%', height: 420, border: '1px solid #f0f0f0', borderRadius: 8 }}
        />
      </Modal>

      <Divider style={{ margin: '24px 0 12px' }} />

      <Title level={5} style={{ marginBottom: 8 }}>
        💡 주의사항 / 전제 조건
      </Title>
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Text type="secondary">
          <b>① 공유 세션 전제</b> — 이 방식은 SSO 로그인이 부모가 검증할 수 있는 세션/쿠키를 만드는
          경우에만 동작한다 (같은 SSO 생태계, 공유 인증 도메인 등).
        </Text>
        <Text type="secondary">
          <b>② SameSite=None; Secure</b> — 크로스 도메인(제3자)에서 쿠키가 보내지려면
          SameSite=None 속성이 필요하고, <b>HTTPS</b> 가 필수다.
        </Text>
        <Text type="secondary">
          <b>③ 폴링 vs 푸시</b> — 팝업 수정이 가능했다면 postMessage/StorageEvent(푸시)가 이 폴링보다
          즉각적이고 확실하다. 수정 불가라는 제약 때문에 어쩔 수 없이 폴링을 쓴다.
        </Text>
      </Space>

      <Paragraph type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
        🚫 진짜 한계: 부모 백엔드가 그 타 도메인 세션을 <b>검증할 방법조차 없다면</b> (완전히 분리된
        독립 세션) 부모 단독으로는 감지가 불가능하다. 그 경우엔 타 도메인 측이 부모 도메인에
        세션을 공유하도록(또는 postMessage/리다이렉트 협조) 하는 변화가 필수다.
      </Paragraph>
    </div>
  )
}

export default SsoIframePopup

