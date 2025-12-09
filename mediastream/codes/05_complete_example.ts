/**
 * Chapter 5 예제: 완성형 실시간 오디오 STT 클라이언트
 * 
 * 이 파일은 실행 가능한 완전한 예제입니다.
 * HTML 파일과 함께 사용하세요.
 */

// ============================================
// 1. 타입 정의
// ============================================

interface ClientConfig {
  timeslice?: number;
  mimeType?: string;
  audioBitsPerSecond?: number;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

interface StartMessage {
  type: 'start';
  mimeType: string;
  config?: {
    timeslice: number;
    audioBitsPerSecond: number;
  };
}

interface AudioChunkMetadata {
  type: 'audio';
  sequence: number;
  timestamp: number;
  size: number;
  mimeType: string;
}

interface EndMessage {
  type: 'end';
}

interface ServerResponse {
  type: 'transcription' | 'error' | 'ack' | 'connected';
  data?: string;
  sequence?: number;
}

// ============================================
// 2. WebSocketManager (Chapter 4에서 가져옴)
// ============================================

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay = 1000;
  private reconnectTimer: number | null = null;
  private onMessageCallback?: (response: ServerResponse) => void;
  private onErrorCallback?: (error: Event) => void;

  constructor(url: string, maxReconnectAttempts: number = 5) {
    this.url = url;
    this.maxReconnectAttempts = maxReconnectAttempts;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        const timeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            reject(new Error('연결 타임아웃'));
          }
        }, 5000);
        
        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('WebSocket 연결 성공');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error('WebSocket 에러:', error);
          if (this.onErrorCallback) {
            this.onErrorCallback(error);
          }
          reject(error);
        };
        
        this.ws.onclose = (event: CloseEvent) => {
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
        
        this.ws.onmessage = (event: MessageEvent) => {
          if (typeof event.data === 'string') {
            try {
              const response: ServerResponse = JSON.parse(event.data);
              if (this.onMessageCallback) {
                this.onMessageCallback(response);
              }
            } catch (error) {
              console.error('메시지 파싱 실패:', error);
            }
          }
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    console.log(`${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  send(data: string | ArrayBuffer | Blob): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      this.ws.send(data);
      return true;
    } catch (error) {
      console.error('전송 실패:', error);
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

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// ============================================
// 3. RealTimeAudioSTTClient 클래스
// ============================================

class RealTimeAudioSTTClient {
  private wsManager: WebSocketManager;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private sequenceNumber = 0;
  private isStreaming = false;
  private config: Required<ClientConfig>;

  constructor(wsUrl: string, config: ClientConfig = {}) {
    this.config = {
      timeslice: 100,
      mimeType: '',
      audioBitsPerSecond: 128000,
      autoReconnect: true,
      maxReconnectAttempts: 5,
      ...config,
    };
    
    this.wsManager = new WebSocketManager(wsUrl, this.config.maxReconnectAttempts);
    this.setupMessageHandlers();
  }

  async start(): Promise<void> {
    if (this.isStreaming) {
      throw new Error('이미 스트리밍 중입니다.');
    }

    try {
      await this.wsManager.connect();
      await this.setupMediaStream();
      await this.setupMediaRecorder();
      this.sendStartMessage();
      
      if (this.mediaRecorder) {
        this.mediaRecorder.start(this.config.timeslice);
        this.isStreaming = true;
        this.onStart?.();
      }
      
    } catch (error) {
      console.error('스트리밍 시작 실패:', error);
      this.onError?.(error);
      throw error;
    }
  }

  private async setupMediaStream(): Promise<void> {
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
  }

  private async setupMediaRecorder(): Promise<void> {
    if (!this.stream) {
      throw new Error('MediaStream이 없습니다.');
    }

    const mimeType = this.config.mimeType || this.getBestMimeType();
    
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType,
      audioBitsPerSecond: this.config.audioBitsPerSecond,
    });

    this.mediaRecorder.ondataavailable = async (event: BlobEvent) => {
      if (event.data && event.data.size > 0 && this.wsManager.isConnected()) {
        await this.sendAudioChunk(event.data);
      }
    };

    this.mediaRecorder.onerror = (event: MediaRecorderErrorEvent) => {
      console.error('MediaRecorder 에러:', event.error);
      this.onError?.(event.error);
    };
  }

  private async sendAudioChunk(blob: Blob): Promise<void> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      
      const metadata: AudioChunkMetadata = {
        type: 'audio',
        sequence: this.sequenceNumber++,
        timestamp: Date.now(),
        size: arrayBuffer.byteLength,
        mimeType: blob.type,
      };
      
      this.wsManager.send(JSON.stringify(metadata));
      this.wsManager.send(arrayBuffer);
      
      this.onChunkSent?.(metadata);
      
    } catch (error) {
      console.error('청크 전송 실패:', error);
      this.onError?.(error);
    }
  }

  private sendStartMessage(): void {
    if (!this.mediaRecorder) {
      return;
    }

    const message: StartMessage = {
      type: 'start',
      mimeType: this.mediaRecorder.mimeType,
      config: {
        timeslice: this.config.timeslice,
        audioBitsPerSecond: this.config.audioBitsPerSecond,
      },
    };

    this.wsManager.send(JSON.stringify(message));
  }

  private setupMessageHandlers(): void {
    this.wsManager.onMessage((response: ServerResponse) => {
      switch (response.type) {
        case 'transcription':
          this.onTranscription?.(response.data || '');
          break;
        case 'error':
          this.onError?.(new Error(response.data || '서버 에러'));
          break;
        case 'ack':
          this.onAck?.(response.sequence || 0);
          break;
        case 'connected':
          console.log('서버 연결 확인');
          break;
      }
    });
    
    this.wsManager.onError((error) => {
      this.onError?.(error);
    });
  }

  stop(): void {
    if (!this.isStreaming) {
      return;
    }

    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    const endMessage: EndMessage = { type: 'end' };
    this.wsManager.send(JSON.stringify(endMessage));
    this.wsManager.close();

    this.isStreaming = false;
    this.sequenceNumber = 0;
    this.onStop?.();
  }

  // 콜백 함수들
  onStart?: () => void;
  onStop?: () => void;
  onTranscription?: (text: string) => void;
  onError?: (error: unknown) => void;
  onChunkSent?: (metadata: AudioChunkMetadata) => void;
  onAck?: (sequence: number) => void;

  getIsStreaming(): boolean {
    return this.isStreaming;
  }

  private getBestMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return '';
  }
}

// ============================================
// 4. 전역 변수 및 메인 함수
// ============================================

let client: RealTimeAudioSTTClient | null = null;

async function startSTT(): Promise<void> {
  try {
    const wsUrl = 'ws://localhost:8000/ws/audio/';
    
    client = new RealTimeAudioSTTClient(wsUrl, {
      timeslice: 100,
      audioBitsPerSecond: 128000,
      autoReconnect: true,
    });

    // 콜백 설정
    client.onStart = () => {
      console.log('STT 시작');
      updateUI('streaming');
    };

    client.onStop = () => {
      console.log('STT 정지');
      updateUI('stopped');
    };

    client.onTranscription = (text: string) => {
      console.log('전사 결과:', text);
      updateTranscription(text);
    };

    client.onError = (error: unknown) => {
      console.error('에러:', error);
      updateError(String(error));
    };

    client.onChunkSent = (metadata: AudioChunkMetadata) => {
      updateStreamingInfo(metadata);
    };

    await client.start();
    
  } catch (error) {
    console.error('STT 시작 실패:', error);
    alert('STT를 시작할 수 없습니다. 서버가 실행 중인지 확인하세요.');
    updateUI('stopped');
  }
}

function stopSTT(): void {
  if (client) {
    client.stop();
    client = null;
    updateUI('stopped');
  }
}

// ============================================
// 5. UI 업데이트 함수
// ============================================

function updateUI(state: 'stopped' | 'streaming'): void {
  const statusElement = document.getElementById('status');
  const startButton = document.getElementById('startBtn') as HTMLButtonElement;
  const stopButton = document.getElementById('stopBtn') as HTMLButtonElement;
  const wsStatusElement = document.getElementById('wsStatus');

  if (!statusElement || !startButton || !stopButton) {
    return;
  }

  switch (state) {
    case 'stopped':
      statusElement.textContent = '정지됨';
      statusElement.style.color = '#666';
      startButton.disabled = false;
      stopButton.disabled = true;
      if (wsStatusElement) {
        wsStatusElement.textContent = '연결 안 됨';
        wsStatusElement.style.color = '#f44336';
      }
      break;
    case 'streaming':
      statusElement.textContent = 'STT 진행 중...';
      statusElement.style.color = '#4CAF50';
      startButton.disabled = true;
      stopButton.disabled = false;
      if (wsStatusElement) {
        wsStatusElement.textContent = '연결됨';
        wsStatusElement.style.color = '#4CAF50';
      }
      break;
  }
}

function updateTranscription(text: string): void {
  const transcriptionElement = document.getElementById('transcription');
  if (transcriptionElement) {
    transcriptionElement.textContent = text;
    transcriptionElement.scrollTop = transcriptionElement.scrollHeight;
  }
}

function updateStreamingInfo(metadata: AudioChunkMetadata): void {
  const infoElement = document.getElementById('streamingInfo');
  if (infoElement) {
    infoElement.innerHTML = `
      <strong>시퀀스:</strong> ${metadata.sequence}<br>
      <strong>크기:</strong> ${(metadata.size / 1024).toFixed(2)} KB<br>
      <strong>시간:</strong> ${new Date(metadata.timestamp).toLocaleTimeString()}
    `;
  }
}

function updateError(message: string): void {
  const errorElement = document.getElementById('error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

// ============================================
// 6. 페이지 로드 시 초기화
// ============================================

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    console.log('완성형 STT 클라이언트 준비 완료');
    
    updateUI('stopped');

    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');

    startBtn?.addEventListener('click', startSTT);
    stopBtn?.addEventListener('click', stopSTT);
  });
}

// ============================================
// 7. 내보내기
// ============================================

export {
  RealTimeAudioSTTClient,
  WebSocketManager,
  startSTT,
  stopSTT,
};

