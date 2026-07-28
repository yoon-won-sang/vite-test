/**
 * Prime Number Calculator Web Worker
 *
 * 이 워커는 메인 스레드에서 CPU 집약적인 소수 계산 작업을 수행하여
 * UI의 블로킹 없이 백그라운드에서 실행되도록 합니다.
 *
 * 메인 스레드와의 통신:
 * - 'start': 계산 시작 (limit, batchSize 포함)
 * - 'stop': 계산 중단
 * - 'progress': 진행 상황 전송 (found, checked, elapsed)
 * - 'complete': 계산 완료 (primes, count, elapsed)
 * - 'error': 오류 발생 (message)
 */

interface StartMessage {
  type: 'start'
  limit: number
  batchSize?: number
}

interface StopMessage {
  type: 'stop'
}

type WorkerMessage = StartMessage | StopMessage

interface ProgressMessage {
  type: 'progress'
  found: number
  checked: number
  limit: number
  elapsed: number
}

interface CompleteMessage {
  type: 'complete'
  primes: number[]
  count: number
  elapsed: number
}

interface ErrorMessage {
  type: 'error'
  message: string
}

type WorkerResponse = ProgressMessage | CompleteMessage | ErrorMessage

/**
 * Worker 전역 객체 타입 캐스팅
 * DOM lib의 self(Window)를 Worker 전용 타입으로 변환
 */
const workerSelf = self as unknown as {
  onmessage: ((event: MessageEvent) => void) | null
  postMessage: (message: any, transfer?: Transferable[]) => void
}

/**
 * 주어진 숫자가 소수인지 확인합니다.
 * @param num 확인할 숫자
 * @returns 소수 여부
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

// 계산 제어 플래그
let isRunning = false

/**
 * 지정된 범위 내의 소수를 계산합니다.
 * 중간 중간 진행 상황을 메인 스레드로 전송합니다.
 */
function calculatePrimes(limit: number, batchSize: number = 10000): void {
  const startTime = Date.now()
  const primes: number[] = []
  let checked = 0
  let lastProgressTime = startTime

  for (let num = 2; num <= limit; num++) {
    // 중지 요청이 왔는지 확인
    if (!isRunning) {
      return
    }

    if (isPrime(num)) {
      primes.push(num)
    }
    checked++

    // 일정 간격으로 진행 상황 전송 (batchSize마다 또는 100ms마다)
    const now = Date.now()
    if (checked % batchSize === 0 || now - lastProgressTime > 100) {
      const elapsed = Date.now() - startTime
      const progressMsg: ProgressMessage = {
        type: 'progress',
        found: primes.length,
        checked,
        limit,
        elapsed,
      }
      workerSelf.postMessage(progressMsg)
      lastProgressTime = now
    }
  }

  // 최종 결과 전송
  const elapsed = Date.now() - startTime
  const completeMsg: CompleteMessage = {
    type: 'complete',
    primes,
    count: primes.length,
    elapsed,
  }
  workerSelf.postMessage(completeMsg)
}

// 메시지 이벤트 핸들러
workerSelf.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data

  try {
    switch (message.type) {
      case 'start': {
        isRunning = true
        const limit = message.limit
        const batchSize = message.batchSize ?? 10000
        calculatePrimes(limit, batchSize)
        break
      }

      case 'stop': {
        isRunning = false
        break
      }

      default: {
        const errorMsg: ErrorMessage = {
          type: 'error',
          message: `Unknown message type: ${(message as any).type}`,
        }
        workerSelf.postMessage(errorMsg)
      }
    }
  } catch (err) {
    const errorMsg: ErrorMessage = {
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    }
    workerSelf.postMessage(errorMsg)
  }
}
