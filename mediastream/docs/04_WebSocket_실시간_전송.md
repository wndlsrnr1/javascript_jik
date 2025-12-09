# Chapter 4: WebSocket 연결 및 실시간 전송

## 📖 학습 목표

이 챕터를 완료하면 다음을 이해할 수 있습니다:

- WebSocket이 무엇인지, HTTP와의 차이
- WebSocket 연결을 수립하고 관리하는 방법
- 이진 데이터(ArrayBuffer)를 WebSocket으로 전송하는 방법
- 연결 상태 관리 및 재연결 로직
- Django 서버와의 통신 프로토콜 설계

---

## 4.1 WebSocket이란 무엇인가?

### 개념 이해하기

**WebSocket**은 브라우저와 서버 간에 **양방향 실시간 통신**을 가능하게 하는 프로토콜입니다.

일상 생활의 비유:

- **전화 통화**: HTTP는 편지처럼 한 번 보내면 끝이지만, WebSocket은 전화처럼 실시간으로 대화할 수 있습니다.
- **라이브 스트리밍**: 실시간으로 데이터를 주고받을 수 있습니다.
- **채팅**: 양방향으로 즉시 메시지를 주고받을 수 있습니다.

### HTTP vs WebSocket

| 구분      | HTTP               | WebSocket                   |
| --------- | ------------------ | --------------------------- |
| 연결 방식 | 요청-응답 (단방향) | 지속적 연결 (양방향)        |
| 연결 유지 | 매번 새로 연결     | 한 번 연결 후 유지          |
| 실시간성  | 낮음 (폴링 필요)   | 높음 (즉시 전송)            |
| 오버헤드  | 매 요청마다 헤더   | 연결 시 한 번만             |
| 사용 사례 | 웹 페이지 로드     | 실시간 채팅, 게임, 스트리밍 |

### WebSocket의 장점

1. **낮은 지연시간**: 연결이 유지되어 즉시 전송 가능
2. **효율성**: HTTP 헤더 오버헤드가 없음
3. **양방향 통신**: 서버가 클라이언트에게 직접 메시지 전송 가능
4. **실시간성**: 폴링 없이 실시간 데이터 전송

---

## 4.2 WebSocket 연결 수립하기

### 기본 연결

가장 간단한 형태로 WebSocket을 연결합니다:

```typescript
// WebSocket 서버 URL
const wsUrl = "ws://localhost:8000/ws/audio/";
const websocket = new WebSocket(wsUrl);
```

### 보안 연결 (WSS)

프로덕션 환경에서는 반드시 **WSS** (WebSocket Secure)를 사용해야 합니다:

```typescript
// HTTPS와 마찬가지로 암호화된 연결
const wsUrl = "wss://example.com/ws/audio/";
const websocket = new WebSocket(wsUrl);
```

### 연결 상태 확인

WebSocket은 네 가지 상태를 가집니다:

```typescript
// WebSocket 상태 상수
console.log(WebSocket.CONNECTING); // 0: 연결 중
console.log(WebSocket.OPEN); // 1: 연결됨
console.log(WebSocket.CLOSING); // 2: 닫는 중
console.log(WebSocket.CLOSED); // 3: 닫힘

// 현재 상태 확인
console.log(websocket.readyState); // 0, 1, 2, 3 중 하나
```

### 연결 이벤트

```typescript
const websocket = new WebSocket("ws://localhost:8000/ws/audio/");

// 1. 연결 성공
websocket.onopen = (event: Event) => {
  console.log("WebSocket 연결 성공!");
  console.log("서버 URL:", websocket.url);
  console.log("프로토콜:", websocket.protocol);
};

// 2. 메시지 수신
websocket.onmessage = (event: MessageEvent) => {
  console.log("메시지 수신:", event.data);

  // 텍스트 메시지
  if (typeof event.data === "string") {
    console.log("텍스트:", event.data);
  }

  // 이진 데이터 (ArrayBuffer)
  if (event.data instanceof ArrayBuffer) {
    console.log("이진 데이터:", event.data.byteLength, "bytes");
  }

  // Blob
  if (event.data instanceof Blob) {
    console.log("Blob:", event.data.size, "bytes");
  }
};

// 3. 에러 발생
websocket.onerror = (event: Event) => {
  console.error("WebSocket 에러:", event);
};

// 4. 연결 종료
websocket.onclose = (event: CloseEvent) => {
  console.log("WebSocket 연결 종료");
  console.log("코드:", event.code);
  console.log("이유:", event.reason);
  console.log("정상 종료:", event.wasClean);
};
```

---

## 4.3 데이터 전송하기

### 텍스트 메시지 전송

```typescript
if (websocket.readyState === WebSocket.OPEN) {
  websocket.send("Hello, Server!");
}
```

### 이진 데이터 전송 (ArrayBuffer)

실시간 오디오 전송에 가장 적합한 방법입니다:

```typescript
// ArrayBuffer 전송
const arrayBuffer = new ArrayBuffer(1024);
if (websocket.readyState === WebSocket.OPEN) {
  websocket.send(arrayBuffer);
}
```

### Blob 전송

```typescript
const blob = new Blob(["데이터"], { type: "audio/webm" });
if (websocket.readyState === WebSocket.OPEN) {
  websocket.send(blob);
}
```

### TypedArray 전송

```typescript
const uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
if (websocket.readyState === WebSocket.OPEN) {
  websocket.send(uint8Array);
}
```

---

## 4.4 MediaRecorder와 WebSocket 통합

### 실시간 오디오 전송

MediaRecorder에서 받은 Blob을 ArrayBuffer로 변환하여 WebSocket으로 전송합니다:

```typescript
let websocket: WebSocket | null = null;
let mediaRecorder: MediaRecorder | null = null;

// 1. WebSocket 연결
async function connectWebSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    websocket = new WebSocket("ws://localhost:8000/ws/audio/");

    websocket.onopen = () => {
      console.log("WebSocket 연결 성공");
      resolve();
    };

    websocket.onerror = (error) => {
      console.error("WebSocket 연결 실패:", error);
      reject(error);
    };
  });
}

// 2. MediaRecorder 설정
async function setupMediaRecorder(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream, {
    mimeType: "audio/webm;codecs=opus",
  });

  // 3. 데이터 수집 및 전송
  mediaRecorder.ondataavailable = async (event: BlobEvent) => {
    if (
      event.data &&
      event.data.size > 0 &&
      websocket?.readyState === WebSocket.OPEN
    ) {
      try {
        // Blob을 ArrayBuffer로 변환
        const arrayBuffer = await event.data.arrayBuffer();

        // WebSocket으로 전송
        websocket.send(arrayBuffer);

        console.log("전송 완료:", arrayBuffer.byteLength, "bytes");
      } catch (error) {
        console.error("전송 실패:", error);
      }
    }
  };

  // 4. 녹화 시작 (100ms마다 청크 수집)
  mediaRecorder.start(100);
}

// 5. 사용
async function startStreaming(): Promise<void> {
  await connectWebSocket();
  await setupMediaRecorder();
  console.log("실시간 오디오 스트리밍 시작!");
}
```

### 메타데이터와 함께 전송

오디오 데이터와 함께 메타데이터를 전송하는 방법:

```typescript
interface AudioChunkMetadata {
  type: "audio";
  timestamp: number;
  sequence: number;
  mimeType: string;
  size: number;
}

let sequenceNumber = 0;

mediaRecorder.ondataavailable = async (event: BlobEvent) => {
  if (
    event.data &&
    event.data.size > 0 &&
    websocket?.readyState === WebSocket.OPEN
  ) {
    try {
      // 1. 메타데이터 생성
      const metadata: AudioChunkMetadata = {
        type: "audio",
        timestamp: Date.now(),
        sequence: sequenceNumber++,
        mimeType: event.data.type,
        size: event.data.size,
      };

      // 2. 메타데이터를 JSON으로 전송
      websocket.send(
        JSON.stringify({
          type: "metadata",
          data: metadata,
        })
      );

      // 3. 오디오 데이터를 ArrayBuffer로 변환하여 전송
      const arrayBuffer = await event.data.arrayBuffer();
      websocket.send(arrayBuffer);
    } catch (error) {
      console.error("전송 실패:", error);
    }
  }
};
```

---

## 4.5 연결 상태 관리

### 상태 확인 함수

```typescript
function isWebSocketConnected(ws: WebSocket | null): boolean {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

// 사용 예제
if (isWebSocketConnected(websocket)) {
  websocket.send(data);
} else {
  console.warn("WebSocket이 연결되지 않았습니다.");
}
```

### 안전한 전송 함수

```typescript
function safeSend(
  ws: WebSocket | null,
  data: string | ArrayBuffer | Blob
): boolean {
  if (!ws) {
    console.warn("WebSocket이 초기화되지 않았습니다.");
    return false;
  }

  if (ws.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket이 연결되지 않았습니다. 상태:", ws.readyState);
    return false;
  }

  try {
    ws.send(data);
    return true;
  } catch (error) {
    console.error("전송 실패:", error);
    return false;
  }
}

// 사용 예제
const arrayBuffer = await blob.arrayBuffer();
safeSend(websocket, arrayBuffer);
```

---

## 4.6 재연결 로직

### 자동 재연결

연결이 끊어졌을 때 자동으로 재연결하는 로직:

```typescript
class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1초

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("WebSocket 연결 성공");
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket 에러:", error);
        reject(error);
      };

      this.ws.onclose = (event: CloseEvent) => {
        console.log("WebSocket 연결 종료:", event.code, event.reason);

        // 정상 종료가 아니면 재연결 시도
        if (
          !event.wasClean &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * this.reconnectAttempts;
          console.log(
            `${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
          );

          setTimeout(() => {
            this.connect().catch(console.error);
          }, delay);
        }
      };
    });
  }

  send(data: string | ArrayBuffer | Blob): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      return true;
    }
    return false;
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

// 사용 예제
const wsManager = new WebSocketManager("ws://localhost:8000/ws/audio/");
await wsManager.connect();

// 데이터 전송
const arrayBuffer = await blob.arrayBuffer();
wsManager.send(arrayBuffer);
```

---

## 4.7 에러 처리

### 일반적인 에러

1. **연결 실패**: 서버가 실행되지 않았거나 URL이 잘못됨
2. **인증 실패**: 서버에서 연결을 거부함
3. **네트워크 오류**: 인터넷 연결 문제
4. **타임아웃**: 서버 응답 없음

### 에러 처리 예제

```typescript
class RobustWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessageCallback?: (data: ArrayBuffer) => void;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        // 타임아웃 설정 (5초)
        const timeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            reject(new Error("연결 타임아웃"));
          }
        }, 5000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log("WebSocket 연결 성공");
          resolve();
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error("WebSocket 에러:", error);
          reject(error);
        };

        this.ws.onclose = (event: CloseEvent) => {
          console.log("WebSocket 종료:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });

          // 비정상 종료 처리
          if (!event.wasClean) {
            console.error("비정상 종료:", event.code, event.reason);
          }
        };

        this.ws.onmessage = (event: MessageEvent) => {
          if (this.onMessageCallback && event.data instanceof ArrayBuffer) {
            this.onMessageCallback(event.data);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  send(data: string | ArrayBuffer | Blob): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket이 연결되지 않았습니다.");
      return false;
    }

    try {
      this.ws.send(data);
      return true;
    } catch (error) {
      console.error("전송 실패:", error);
      return false;
    }
  }

  onMessage(callback: (data: ArrayBuffer) => void): void {
    this.onMessageCallback = callback;
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

---

## 4.8 Django 서버 연동

### 프로토콜 설계

클라이언트와 서버 간의 통신 프로토콜을 정의합니다:

```typescript
// 1. 연결 시작 메시지
interface StartMessage {
  type: "start";
  mimeType: string;
  sampleRate?: number;
}

// 2. 오디오 청크 메시지
interface AudioChunkMessage {
  type: "audio";
  sequence: number;
  timestamp: number;
  data: ArrayBuffer; // 실제 오디오 데이터
}

// 3. 종료 메시지
interface EndMessage {
  type: "end";
}

// 4. 서버 응답 메시지
interface ServerResponse {
  type: "transcription" | "error" | "ack";
  data?: string;
  sequence?: number;
}
```

### 클라이언트 구현

```typescript
class AudioStreamClient {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private sequenceNumber = 0;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async start(): Promise<void> {
    // 1. WebSocket 연결
    await this.connectWebSocket();

    // 2. MediaRecorder 설정
    await this.setupMediaRecorder();

    // 3. 시작 메시지 전송
    this.sendStartMessage();
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("Django 서버 연결 성공");
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error("연결 실패:", error);
        reject(error);
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleServerMessage(event);
      };
    });
  }

  private async setupMediaRecorder(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    this.mediaRecorder.ondataavailable = async (event: BlobEvent) => {
      if (
        event.data &&
        event.data.size > 0 &&
        this.ws?.readyState === WebSocket.OPEN
      ) {
        const arrayBuffer = await event.data.arrayBuffer();

        // 오디오 청크 전송
        const message: AudioChunkMessage = {
          type: "audio",
          sequence: this.sequenceNumber++,
          timestamp: Date.now(),
          data: arrayBuffer,
        };

        // 메타데이터를 JSON으로, 데이터를 ArrayBuffer로 분리 전송
        this.ws.send(
          JSON.stringify({
            type: "audio",
            sequence: message.sequence,
            timestamp: message.timestamp,
            size: arrayBuffer.byteLength,
          })
        );

        this.ws.send(arrayBuffer);
      }
    };

    this.mediaRecorder.start(100); // 100ms마다 청크 수집
  }

  private sendStartMessage(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: StartMessage = {
      type: "start",
      mimeType: this.mediaRecorder?.mimeType || "audio/webm",
    };

    this.ws.send(JSON.stringify(message));
  }

  private handleServerMessage(event: MessageEvent): void {
    if (typeof event.data === "string") {
      try {
        const response: ServerResponse = JSON.parse(event.data);

        switch (response.type) {
          case "transcription":
            console.log("전사 결과:", response.data);
            // UI에 표시
            break;
          case "error":
            console.error("서버 에러:", response.data);
            break;
          case "ack":
            console.log("서버 확인:", response.sequence);
            break;
        }
      } catch (error) {
        console.error("메시지 파싱 실패:", error);
      }
    }
  }

  stop(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    if (this.ws) {
      this.ws.send(JSON.stringify({ type: "end" }));
      this.ws.close();
      this.ws = null;
    }
  }
}

// 사용 예제
const client = new AudioStreamClient("ws://localhost:8000/ws/audio/");
await client.start();

// 10초 후 정지
setTimeout(() => {
  client.stop();
}, 10000);
```

---

## 4.9 성능 최적화

### 버퍼링 최소화

실시간 전송을 위해 버퍼링을 최소화합니다:

```typescript
// 작은 timeslice 사용 (더 실시간에 가까움)
mediaRecorder.start(50); // 50ms마다 청크 수집

// 하지만 너무 작으면 오버헤드가 증가하므로 적절한 균형 필요
// 권장: 50-200ms
```

### 전송 큐 관리

전송이 지연될 때 큐를 관리합니다:

```typescript
class TransmissionQueue {
  private queue: ArrayBuffer[] = [];
  private maxQueueSize = 10;
  private isTransmitting = false;

  async add(
    data: ArrayBuffer,
    sendFn: (data: ArrayBuffer) => Promise<void>
  ): Promise<void> {
    this.queue.push(data);

    // 큐가 너무 크면 오래된 데이터 제거
    if (this.queue.length > this.maxQueueSize) {
      const removed = this.queue.shift();
      console.warn("큐 오버플로우, 오래된 데이터 제거:", removed?.byteLength);
    }

    // 전송 중이 아니면 시작
    if (!this.isTransmitting) {
      this.processQueue(sendFn);
    }
  }

  private async processQueue(
    sendFn: (data: ArrayBuffer) => Promise<void>
  ): Promise<void> {
    this.isTransmitting = true;

    while (this.queue.length > 0) {
      const data = this.queue.shift()!;
      await sendFn(data);
    }

    this.isTransmitting = false;
  }
}
```

---

## 4.10 요약

이 챕터에서 배운 내용:

1. **WebSocket**: 양방향 실시간 통신 프로토콜
2. **연결 수립**: WebSocket 생성 및 이벤트 핸들러 등록
3. **데이터 전송**: ArrayBuffer, Blob, 텍스트 전송
4. **MediaRecorder 통합**: 실시간 오디오 스트리밍
5. **연결 관리**: 상태 확인, 재연결 로직
6. **에러 처리**: 다양한 에러 상황 처리
7. **Django 연동**: 프로토콜 설계 및 구현
8. **성능 최적화**: 버퍼링, 큐 관리

---

## 4.11 다음 단계

다음 챕터에서는 모든 내용을 통합하여 완성형 예제를 만들고, Django 서버 수신 코드도 함께 제공합니다.

---

## 연습 문제

1. WebSocket을 연결하고 메시지를 전송/수신하는 함수를 작성하세요.
2. MediaRecorder에서 받은 Blob을 WebSocket으로 전송하는 코드를 작성하세요.
3. 자동 재연결 기능이 있는 WebSocket 클래스를 만드세요.

답안은 `codes/04_WebSocket_streaming.ts` 파일을 참고하세요.
