/**
 * Chapter 4 예제: WebSocket을 사용한 실시간 오디오 스트리밍
 *
 * 이 파일은 실행 가능한 완전한 예제입니다.
 * HTML 파일과 함께 사용하세요.
 */

// ============================================
// 1. 타입 정의
// ============================================

interface StartMessage {
  type: "start";
  mimeType: string;
  sampleRate?: number;
}

interface AudioChunkMetadata {
  type: "audio";
  sequence: number;
  timestamp: number;
  size: number;
  mimeType: string;
}

interface EndMessage {
  type: "end";
}

interface ServerResponse {
  type: "transcription" | "error" | "ack" | "connected";
  data?: string;
  sequence?: number;
}

// ============================================
// 2. WebSocketManager 클래스
// ============================================

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: number | null = null;
  private onMessageCallback?: (response: ServerResponse) => void;
  private onErrorCallback?: (error: Event) => void;

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
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error("WebSocket 에러:", error);
          if (this.onErrorCallback) {
            this.onErrorCallback(error);
          }
          reject(error);
        };

        this.ws.onclose = (event: CloseEvent) => {
          console.log("WebSocket 종료:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });

          // 비정상 종료 시 재연결 시도
          if (
            !event.wasClean &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onmessage = (event: MessageEvent) => {
          this.handleMessage(event);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    console.log(
      `${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  private handleMessage(event: MessageEvent): void {
    if (typeof event.data === "string") {
      try {
        const response: ServerResponse = JSON.parse(event.data);
        if (this.onMessageCallback) {
          this.onMessageCallback(response);
        }
      } catch (error) {
        console.error("메시지 파싱 실패:", error);
      }
    } else if (event.data instanceof ArrayBuffer) {
      console.log("이진 데이터 수신:", event.data.byteLength, "bytes");
    }
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

  onMessage(callback: (response: ServerResponse) => void): void {
    this.onMessageCallback = callback;
  }

  onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback;
  }

  close(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// ============================================
// 3. AudioStreamClient 클래스
// ============================================

class AudioStreamClient {
  private wsManager: WebSocketManager;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private sequenceNumber = 0;
  private isStreaming = false;

  constructor(wsUrl: string) {
    this.wsManager = new WebSocketManager(wsUrl);
    this.setupMessageHandlers();
  }

  async start(): Promise<void> {
    if (this.isStreaming) {
      console.warn("이미 스트리밍 중입니다.");
      return;
    }

    try {
      // 1. WebSocket 연결
      await this.wsManager.connect();

      // 2. MediaRecorder 설정
      await this.setupMediaRecorder();

      // 3. 시작 메시지 전송
      this.sendStartMessage();

      // 4. 녹화 시작
      if (this.mediaRecorder) {
        this.mediaRecorder.start(100); // 100ms마다 청크 수집
        this.isStreaming = true;
        console.log("실시간 오디오 스트리밍 시작!");
      }
    } catch (error) {
      console.error("스트리밍 시작 실패:", error);
      throw error;
    }
  }

  private async setupMediaRecorder(): Promise<void> {
    // 스트림 가져오기
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // MIME 타입 결정
    const mimeType = this.getBestMimeType();

    // MediaRecorder 생성
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType,
      audioBitsPerSecond: 128000,
    });

    // 데이터 수집 및 전송
    this.mediaRecorder.ondataavailable = async (event: BlobEvent) => {
      if (event.data && event.data.size > 0 && this.wsManager.isConnected()) {
        await this.sendAudioChunk(event.data);
      }
    };

    // 에러 처리
    this.mediaRecorder.onerror = (event: MediaRecorderErrorEvent) => {
      console.error("MediaRecorder 에러:", event.error);
    };
  }

  private async sendAudioChunk(blob: Blob): Promise<void> {
    try {
      // ArrayBuffer로 변환
      const arrayBuffer = await blob.arrayBuffer();

      // 메타데이터 생성
      const metadata: AudioChunkMetadata = {
        type: "audio",
        sequence: this.sequenceNumber++,
        timestamp: Date.now(),
        size: arrayBuffer.byteLength,
        mimeType: blob.type,
      };

      // 메타데이터를 JSON으로 전송
      this.wsManager.send(JSON.stringify(metadata));

      // 오디오 데이터를 ArrayBuffer로 전송
      this.wsManager.send(arrayBuffer);

      // UI 업데이트
      updateStreamingInfo(metadata);
    } catch (error) {
      console.error("청크 전송 실패:", error);
    }
  }

  private sendStartMessage(): void {
    if (!this.mediaRecorder) {
      return;
    }

    const message: StartMessage = {
      type: "start",
      mimeType: this.mediaRecorder.mimeType,
    };

    this.wsManager.send(JSON.stringify(message));
  }

  private setupMessageHandlers(): void {
    this.wsManager.onMessage((response: ServerResponse) => {
      switch (response.type) {
        case "connected":
          console.log("서버 연결 확인");
          break;
        case "transcription":
          console.log("전사 결과:", response.data);
          updateTranscription(response.data || "");
          break;
        case "error":
          console.error("서버 에러:", response.data);
          updateError(response.data || "알 수 없는 에러");
          break;
        case "ack":
          console.log("서버 확인:", response.sequence);
          break;
      }
    });

    this.wsManager.onError((error) => {
      console.error("WebSocket 에러:", error);
      updateError("연결 에러가 발생했습니다.");
    });
  }

  private getBestMimeType(): string {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return "";
  }

  stop(): void {
    if (!this.isStreaming) {
      return;
    }

    // MediaRecorder 정지
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    // 스트림 정리
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    // 종료 메시지 전송
    const endMessage: EndMessage = { type: "end" };
    this.wsManager.send(JSON.stringify(endMessage));

    // WebSocket 종료
    this.wsManager.close();

    this.isStreaming = false;
    this.sequenceNumber = 0;
    console.log("스트리밍 정지");
  }

  getIsStreaming(): boolean {
    return this.isStreaming;
  }
}

// ============================================
// 4. 전역 변수 및 메인 함수
// ============================================

let client: AudioStreamClient | null = null;

/**
 * 스트리밍 시작
 */
async function startStreaming(): Promise<void> {
  try {
    // WebSocket URL (Django 서버 주소로 변경)
    const wsUrl = "ws://localhost:8000/ws/audio/";

    client = new AudioStreamClient(wsUrl);
    await client.start();

    updateUI("streaming");
  } catch (error) {
    console.error("스트리밍 시작 실패:", error);
    alert("스트리밍을 시작할 수 없습니다. 서버가 실행 중인지 확인하세요.");
    updateUI("stopped");
  }
}

/**
 * 스트리밍 정지
 */
function stopStreaming(): void {
  if (client) {
    client.stop();
    client = null;
    updateUI("stopped");
  }
}

// ============================================
// 5. UI 업데이트 함수
// ============================================

function updateUI(state: "stopped" | "streaming"): void {
  const statusElement = document.getElementById("status");
  const startButton = document.getElementById("startBtn") as HTMLButtonElement;
  const stopButton = document.getElementById("stopBtn") as HTMLButtonElement;
  const wsStatusElement = document.getElementById("wsStatus");

  if (!statusElement || !startButton || !stopButton) {
    return;
  }

  switch (state) {
    case "stopped":
      statusElement.textContent = "정지됨";
      statusElement.style.color = "#666";
      startButton.disabled = false;
      stopButton.disabled = true;
      if (wsStatusElement) {
        wsStatusElement.textContent = "연결 안 됨";
        wsStatusElement.style.color = "#f44336";
      }
      break;
    case "streaming":
      statusElement.textContent = "스트리밍 중...";
      statusElement.style.color = "#4CAF50";
      startButton.disabled = true;
      stopButton.disabled = false;
      if (wsStatusElement) {
        wsStatusElement.textContent = "연결됨";
        wsStatusElement.style.color = "#4CAF50";
      }
      break;
  }
}

function updateStreamingInfo(metadata: AudioChunkMetadata): void {
  const infoElement = document.getElementById("streamingInfo");
  if (infoElement) {
    infoElement.innerHTML = `
      <strong>시퀀스:</strong> ${metadata.sequence}<br>
      <strong>크기:</strong> ${(metadata.size / 1024).toFixed(2)} KB<br>
      <strong>타임스탬프:</strong> ${new Date(
        metadata.timestamp
      ).toLocaleTimeString()}
    `;
  }
}

function updateTranscription(text: string): void {
  const transcriptionElement = document.getElementById("transcription");
  if (transcriptionElement) {
    transcriptionElement.textContent = text;
  }
}

function updateError(message: string): void {
  const errorElement = document.getElementById("error");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";

    // 5초 후 자동 숨김
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }
}

// ============================================
// 6. 페이지 로드 시 초기화
// ============================================

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    console.log("WebSocket 스트리밍 예제 준비 완료");

    updateUI("stopped");

    // 버튼 이벤트 리스너
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");

    startBtn?.addEventListener("click", startStreaming);
    stopBtn?.addEventListener("click", stopStreaming);
  });
}

// ============================================
// 7. 내보내기 (모듈 시스템 사용 시)
// ============================================

export { WebSocketManager, AudioStreamClient, startStreaming, stopStreaming };
