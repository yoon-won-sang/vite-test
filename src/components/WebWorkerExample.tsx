/**
 * Web Worker Example Component
 *
 * 이 컴포넌트는 Web Worker를 사용하여 CPU 집약적인 소수 계산 작업을
 * 백그라운드 스레드에서 수행하는 예제를 보여줍니다.
 *
 * 주요 기능:
 * - Web Worker를 통한 비동기 소수 계산 (UI 블로킹 없음)
 * - 실시간 진행 상황 표시
 * - 계산 시작/중지/초기화
 * - 메인 스레드 동기 계산과의 성능 비교
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { Button, Space, Progress, InputNumber, message, Tabs, Tag, Typography } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClearOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

// Worker 메시지 타입 (primeWorker.ts와 동기화)
interface WorkerProgressMessage {
  type: 'progress'
  found: number
  checked: number
  limit: number
  elapsed: number
}

interface WorkerCompleteMessage {
  type: 'complete'
  primes: number[]
  count: number
  elapsed: number
  limit: number
}

interface WorkerErrorMessage {
  type: 'error'
  message: string
}

type WorkerResponse = WorkerProgressMessage | WorkerCompleteMessage | WorkerErrorMessage

const { Text, Title } = Typography

/**
 * 주어진 숫자가 소수인지 확인합니다 (메인 스레드용).
 */
function isPrime(num: number): boolean {
  if (num < 2) return false
  if (num === 2) return true
  if (num % 2 === 0) return false
  const limit = Math.sqrt(num)
  for (let i = 3; i <= limit; i += 2) {
    if (num % i === 0) return false
  }
  return true
}

/**
 * 메인 스레드에서 동기적으로 소수를 계산합니다 (UI 블로킹).
 */
function calculatePrimesSync(limit: number): { primes: number[]; elapsed: number } {
  const startTime = Date.now()
  const primes: number[] = []
  for (let num = 2; num <= limit; num++) {
    if (isPrime(num)) {
      primes.push(num)
    }
  }
  const elapsed = Date.now() - startTime
  return { primes, elapsed }
}

const WebWorkerExample = () => {
  // Web Worker 관련 상태
  const workerRef = useRef<Worker | null>(null)
  const [workerStatus, setWorkerStatus] = useState<'idle' | 'running' | 'completed'>('idle')
  const [workerProgress, setWorkerProgress] = useState(0)
  const [workerFound, setWorkerFound] = useState(0)
  const [workerChecked, setWorkerChecked] = useState(0)
  const [workerElapsed, setWorkerElapsed] = useState(0)
  const [workerPrimes, setWorkerPrimes] = useState<number[]>([])
  const [workerLimit, setWorkerLimit] = useState(500000)

  // 메인 스레드 동기 계산 상태
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'completed'>('idle')
  const [syncElapsed, setSyncElapsed] = useState(0)
  const [syncCount, setSyncCount] = useState(0)
  const [syncLimit, setSyncLimit] = useState(500000)

  // Worker 정리 (컴포넌트 언마운트 시)
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  /**
   * Web Worker를 시작합니다.
   */
  const startWorker = useCallback(() => {
    // 기존 워커가 있으면 종료
    if (workerRef.current) {
      workerRef.current.terminate()
    }

    // 새 워커 생성 (Vite의 new URL 방식)
    const worker = new Worker(new URL('../workers/primeWorker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data

      switch (data.type) {
        case 'progress':
          setWorkerProgress(Math.round((data.checked / data.limit) * 100))
          setWorkerFound(data.found)
          setWorkerChecked(data.checked)
          setWorkerElapsed(data.elapsed)
          setWorkerStatus('running')
          break

        case 'complete':
          setWorkerProgress(100)
          setWorkerFound(data.count)
          setWorkerChecked(data.limit)
          setWorkerElapsed(data.elapsed)
          setWorkerPrimes(data.primes)
          setWorkerStatus('completed')
          message.success(
            `Web Worker 계산 완료! ${data.count}개의 소수를 찾았습니다. (${data.elapsed}ms)`,
          )
          break

        case 'error':
          message.error(`Worker 오류: ${data.message}`)
          setWorkerStatus('idle')
          break
      }
    }

    worker.onerror = (error: ErrorEvent) => {
      message.error(`Worker 에러: ${error.message}`)
      setWorkerStatus('idle')
    }

    workerRef.current = worker

    // 시작 메시지 전송
    worker.postMessage({
      type: 'start',
      limit: workerLimit,
      batchSize: 5000,
    })

    setWorkerStatus('running')
    setWorkerProgress(0)
    setWorkerFound(0)
    setWorkerChecked(0)
    setWorkerElapsed(0)
    setWorkerPrimes([])
  }, [workerLimit])

  /**
   * Web Worker를 중지합니다.
   */
  const stopWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'stop' })
      workerRef.current.terminate()
      workerRef.current = null
    }
    setWorkerStatus('idle')
    message.info('Web Worker가 중지되었습니다.')
  }, [])

  /**
   * Web Worker 결과를 초기화합니다.
   */
  const clearWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
    setWorkerStatus('idle')
    setWorkerProgress(0)
    setWorkerFound(0)
    setWorkerChecked(0)
    setWorkerElapsed(0)
    setWorkerPrimes([])
  }, [])

  /**
   * 메인 스레드에서 동기적으로 계산합니다 (UI 블로킹).
   */
  const runSyncCalculation = useCallback(() => {
    setSyncStatus('running')
    setSyncElapsed(0)
    setSyncCount(0)

    // 동기 실행 - UI가 블로킹됨을 보여주기 위해 약간의 지연 없이 실행
    const { primes, elapsed } = calculatePrimesSync(syncLimit)
    setSyncCount(primes.length)
    setSyncElapsed(elapsed)
    setSyncStatus('completed')
    message.success(`동기 계산 완료! ${primes.length}개의 소수를 찾았습니다. (${elapsed}ms)`)
  }, [syncLimit])

  // 워커 결과 미리보기 (처음 20개만)
  const previewPrimes = workerPrimes.slice(0, 20)
  const hasMorePrimes = workerPrimes.length > 20

  return (
    <div className="card-section">
      <Title level={3} style={{ marginTop: 0 }}>
        🚀 Web Worker 예제 - 소수 계산
      </Title>
      <p style={{ marginBottom: 24, color: '#666' }}>
        Web Worker를 사용하면 CPU 집약적인 작업을 백그라운드 스레드에서 실행하여 UI의 반응성을
        유지할 수 있습니다. 아래에서 Web Worker 방식과 메인 스레드 동기 방식을 비교해 보세요.
      </p>

      <Tabs
        type="card"
        items={[
          {
            key: 'worker',
            label: (
              <Space>
                <ThunderboltOutlined />
                Web Worker (비동기)
              </Space>
            ),
            children: (
              <div>
                {/* 제어 패널 */}
                <div
                  style={{
                    marginBottom: 24,
                    padding: 20,
                    background: '#f8f9fa',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                  }}
                >
                  <Space align="center" style={{ marginBottom: 16 }}>
                    <span>계산 범위 (최대값):</span>
                    <InputNumber
                      value={workerLimit}
                      onChange={(value) => setWorkerLimit(value || 100000)}
                      min={10000}
                      max={5000000}
                      step={10000}
                      style={{ width: 180 }}
                      disabled={workerStatus === 'running'}
                      formatter={(value) => ` ${value}`}
                    />
                    <span style={{ color: '#999', fontSize: 13 }}>
                      (큰 값일수록 Web Worker의 효과가 더 뚜렷합니다)
                    </span>
                  </Space>

                  <Space>
                    {workerStatus !== 'running' && workerStatus !== 'completed' && (
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={startWorker}
                        size="large"
                      >
                        Web Worker 시작
                      </Button>
                    )}
                    {workerStatus === 'running' && (
                      <Button
                        danger
                        icon={<PauseCircleOutlined />}
                        onClick={stopWorker}
                        size="large"
                      >
                        중지
                      </Button>
                    )}
                    <Button
                      icon={<ClearOutlined />}
                      onClick={clearWorker}
                      disabled={workerStatus === 'running'}
                    >
                      초기화
                    </Button>
                  </Space>
                </div>

                {/* 진행 상황 */}
                {workerStatus === 'running' && (
                  <div style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <span>진행 상황</span>
                      <Space>
                        <Tag color="processing">찾은 소수: {workerFound}개</Tag>
                        <Tag color="processing">검사한 숫자: {workerChecked.toLocaleString()}</Tag>
                        <Tag color="processing">
                          <ClockCircleOutlined /> {workerElapsed}ms
                        </Tag>
                      </Space>
                    </div>
                    <Progress
                      percent={workerProgress}
                      status="active"
                      format={(percent) => `${percent?.toFixed(1)}%`}
                    />
                  </div>
                )}

                {/* 결과 표시 */}
                {workerStatus === 'completed' && workerPrimes.length > 0 && (
                  <div>
                    <div
                      style={{
                        marginBottom: 16,
                        padding: 16,
                        background: '#f0f9ff',
                        borderRadius: 8,
                        border: '1px solid #b3d9ff',
                      }}
                    >
                      <Space direction="vertical" size="small">
                        <Text strong>
                          ✅ 계산 완료: 총 {workerPrimes.length}개의 소수를 찾았습니다.
                        </Text>
                        <Text>
                          실행 시간: <Tag color="blue">{workerElapsed}ms</Tag>
                        </Text>
                        <Text>
                          찾은 소수 (처음 20개):{' '}
                          <Text code style={{ fontSize: 13 }}>
                            {previewPrimes.join(', ')}
                          </Text>
                          {hasMorePrimes && ' ...'}
                        </Text>
                      </Space>
                    </div>
                  </div>
                )}

                {/* 워커가 유휴 상태일 때 안내 메시지 */}
                {workerStatus === 'idle' && (
                  <div
                    style={{
                      padding: 24,
                      textAlign: 'center',
                      color: '#999',
                      border: '2px dashed #e8e8e8',
                      borderRadius: 8,
                    }}
                  >
                    <ThunderboltOutlined style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }} />
                    <p>
                      "Web Worker 시작" 버튼을 클릭하여 소수 계산을 시작하세요.
                      <br />
                      UI는 완전히 반응적 상태를 유지합니다.
                    </p>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'sync',
            label: '메인 스레드 (동기)',
            children: (
              <div>
                {/* 제어 패널 */}
                <div
                  style={{
                    marginBottom: 24,
                    padding: 20,
                    background: '#fff7f7',
                    borderRadius: 8,
                    border: '1px solid #ffd6d6',
                  }}
                >
                  <Space align="center" style={{ marginBottom: 16 }}>
                    <span>계산 범위 (최대값):</span>
                    <InputNumber
                      value={syncLimit}
                      onChange={(value) => setSyncLimit(value || 100000)}
                      min={10000}
                      max={5000000}
                      step={10000}
                      style={{ width: 180 }}
                      disabled={syncStatus === 'running'}
                      formatter={(value) => ` ${value}`}
                    />
                  </Space>

                  <Space>
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={runSyncCalculation}
                      loading={syncStatus === 'running'}
                      size="large"
                      disabled={syncStatus === 'running'}
                    >
                      동기 계산 시작 (UI 블로킹)
                    </Button>
                  </Space>
                </div>

                {/* 동기 계산 결과 */}
                {syncStatus === 'completed' && (
                  <div
                    style={{
                      padding: 16,
                      background: '#fff2f2',
                      borderRadius: 8,
                      border: '1px solid #ffd6d6',
                    }}
                  >
                    <Space direction="vertical" size="small">
                      <Text strong>⚠️ 동기 계산 완료: 총 {syncCount}개의 소수를 찾았습니다.</Text>
                      <Text>
                        실행 시간: <Tag color="red">{syncElapsed}ms</Tag>
                      </Text>
                      <Text type="warning">
                        이 계산 동안 브라우저 UI가 완전히 블로킹되었습니다. 큰 값에서는 브라우저가
                        멈출 수 있습니다!
                      </Text>
                    </Space>
                  </div>
                )}

                {/* 동기 계산 중 상태 */}
                {syncStatus === 'running' && (
                  <div
                    style={{
                      padding: 16,
                      background: '#fff7f7',
                      borderRadius: 8,
                      border: '1px solid #ffd6d6',
                      textAlign: 'center',
                    }}
                  >
                    <Text type="warning">계산 중... UI가 블로킹되고 있습니다.</Text>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export default WebWorkerExample
