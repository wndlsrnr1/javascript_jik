/**
 * Chapter 2 예제: MediaRecorder를 사용한 오디오 캡처
 *
 * 이 파일은 실행 가능한 완전한 예제입니다.
 * HTML 파일과 함께 사용하세요.
 */

// ============================================
// 1. 타입 정의
// ============================================

interface AudioRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  timeslice?: number; // 실시간 청크 수집 간격 (ms)
}

// ============================================
// 2. AudioRecorder 클래스
// ============================================

class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private timeslice: number;
  private onChunkCallback?: (chunk: Blob) => void;

  constructor(private options: AudioRecorderOptions = {}) {
    this.timeslice = options.timeslice ?? 0;
  }

  /**
   * 녹음 시작
   */
  async start(): Promise<void> {
    try {
      // 1. 스트림 가져오기
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. MIME 타입 결정
      const mimeType = this.options.mimeType || this.getBestMimeType();

      // 3. MediaRecorder 생성
      const recorderOptions: MediaRecorderOptions = {
        mimeType,
        audioBitsPerSecond: this.options.audioBitsPerSecond,
      };

      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);

      // 4. 이벤트 핸들러 등록
      this.setupEventHandlers();

      // 5. 녹화 시작
      if (this.timeslice > 0) {
        this.mediaRecorder.start(this.timeslice);
      } else {
        this.mediaRecorder.start();
      }

      console.log("녹음 시작!", {
        state: this.mediaRecorder.state,
        mimeType: this.mediaRecorder.mimeType,
        timeslice: this.timeslice,
      });
    } catch (error) {
      console.error("녹음 시작 실패:", error);
      throw error;
    }
  }

  /**
   * 녹음 정지 및 Blob 반환
   */
  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder가 초기화되지 않았습니다."));
        return;
      }

      if (this.mediaRecorder.state === "inactive") {
        reject(new Error("녹음이 시작되지 않았습니다."));
        return;
      }

      // stop 이벤트에서 Blob 반환
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, {
          type: this.mediaRecorder!.mimeType,
        });

        console.log("녹음 완료!", {
          blobSize: blob.size,
          blobType: blob.type,
          chunksCount: this.chunks.length,
        });

        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 녹음 일시 정지
   */
  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause();
      console.log("녹음 일시 정지");
    }
  }

  /**
   * 녹음 재개
   */
  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume();
      console.log("녹음 재개");
    }
  }

  /**
   * 현재 상태 반환
   */
  getState(): string {
    return this.mediaRecorder?.state || "inactive";
  }

  /**
   * 수집된 청크 반환 (복사본)
   */
  getChunks(): Blob[] {
    return [...this.chunks];
  }

  /**
   * 청크 수집 시 콜백 등록
   */
  onChunk(callback: (chunk: Blob) => void): void {
    this.onChunkCallback = callback;
  }

  /**
   * 이벤트 핸들러 설정
   */
  private setupEventHandlers(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.chunks.push(event.data);
        console.log(
          `청크 수신: ${event.data.size} bytes (총 ${this.chunks.length}개)`
        );

        // 콜백 호출
        if (this.onChunkCallback) {
          this.onChunkCallback(event.data);
        }
      }
    };

    this.mediaRecorder.onerror = (event: MediaRecorderErrorEvent) => {
      console.error("MediaRecorder 에러:", event.error);
    };

    this.mediaRecorder.onpause = () => {
      console.log("녹음 일시 정지");
    };

    this.mediaRecorder.onresume = () => {
      console.log("녹음 재개");
    };

    this.mediaRecorder.onstart = () => {
      console.log("녹음 시작 이벤트");
    };

    this.mediaRecorder.onstop = () => {
      console.log("녹음 정지 이벤트");
    };
  }

  /**
   * 최적의 MIME 타입 찾기
   */
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

    return ""; // 기본값 사용
  }

  /**
   * 리소스 정리
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.chunks = [];
    this.mediaRecorder = null;
  }
}

// ============================================
// 3. 유틸리티 함수
// ============================================

/**
 * 지원하는 MIME 타입 목록 반환
 */
function getSupportedMimeTypes(): string[] {
  const types = [
    "audio/webm",
    "audio/webm;codecs=opus",
    "audio/ogg;codecs=opus",
    "audio/mp4",
    "audio/mpeg",
  ];

  return types.filter((type) => MediaRecorder.isTypeSupported(type));
}

/**
 * 최적의 MIME 타입 찾기
 */
function getBestAudioMimeType(): string {
  const preferredTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
  ];

  for (const mimeType of preferredTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return "";
}

// ============================================
// 4. 전역 변수 및 메인 함수
// ============================================

let recorder: AudioRecorder | null = null;

/**
 * 녹음 시작
 */
async function startRecording(): Promise<void> {
  try {
    // 기존 녹음기가 있으면 정리
    if (recorder) {
      await stopRecording();
    }

    // 새 녹음기 생성 (100ms마다 청크 수집)
    recorder = new AudioRecorder({
      mimeType: getBestAudioMimeType(),
      audioBitsPerSecond: 128000,
      timeslice: 100, // 실시간 전송을 위한 짧은 간격
    });

    // 청크 수집 시 콜백
    recorder.onChunk((chunk: Blob) => {
      console.log("새 청크 수신:", chunk.size, "bytes");
      // 여기서 WebSocket으로 전송할 수 있음 (Chapter 4)
      updateChunkInfo(chunk.size);
    });

    await recorder.start();
    updateUI("recording");
  } catch (error) {
    console.error("녹음 시작 실패:", error);
    alert("녹음 시작에 실패했습니다. 마이크 권한을 확인해주세요.");
    updateUI("stopped");
  }
}

/**
 * 녹음 정지
 */
async function stopRecording(): Promise<Blob | null> {
  if (!recorder) {
    console.warn("녹음기가 없습니다.");
    return null;
  }

  try {
    const blob = await recorder.stop();
    recorder = null;
    updateUI("stopped");

    // Blob을 재생할 수 있도록 준비
    playBlob(blob);

    return blob;
  } catch (error) {
    console.error("녹음 정지 실패:", error);
    recorder = null;
    updateUI("stopped");
    return null;
  }
}

/**
 * 녹음 일시 정지/재개 토글
 */
function togglePause(): void {
  if (!recorder) {
    console.warn("녹음기가 없습니다.");
    return;
  }

  const state = recorder.getState();

  if (state === "recording") {
    recorder.pause();
    updateUI("paused");
  } else if (state === "paused") {
    recorder.resume();
    updateUI("recording");
  }
}

/**
 * Blob 재생
 */
function playBlob(blob: Blob): void {
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = URL.createObjectURL(blob);

  const container = document.getElementById("playback");
  if (container) {
    container.innerHTML = "";
    container.appendChild(audio);
  }
}

// ============================================
// 5. UI 업데이트 함수
// ============================================

let totalChunksSize = 0;
let chunkCount = 0;

function updateUI(state: "stopped" | "recording" | "paused"): void {
  const statusElement = document.getElementById("status");
  const stateElement = document.getElementById("state");
  const startButton = document.getElementById("startBtn") as HTMLButtonElement;
  const stopButton = document.getElementById("stopBtn") as HTMLButtonElement;
  const pauseButton = document.getElementById("pauseBtn") as HTMLButtonElement;

  if (
    !statusElement ||
    !stateElement ||
    !startButton ||
    !stopButton ||
    !pauseButton
  ) {
    return;
  }

  switch (state) {
    case "stopped":
      statusElement.textContent = "정지됨";
      statusElement.style.color = "#666";
      stateElement.textContent = "inactive";
      startButton.disabled = false;
      stopButton.disabled = true;
      pauseButton.disabled = true;
      pauseButton.textContent = "일시 정지";
      totalChunksSize = 0;
      chunkCount = 0;
      break;
    case "recording":
      statusElement.textContent = "녹음 중...";
      statusElement.style.color = "#4CAF50";
      stateElement.textContent = recorder?.getState() || "unknown";
      startButton.disabled = true;
      stopButton.disabled = false;
      pauseButton.disabled = false;
      pauseButton.textContent = "일시 정지";
      break;
    case "paused":
      statusElement.textContent = "일시 정지됨";
      statusElement.style.color = "#FF9800";
      stateElement.textContent = recorder?.getState() || "unknown";
      startButton.disabled = true;
      stopButton.disabled = false;
      pauseButton.disabled = false;
      pauseButton.textContent = "재개";
      break;
  }
}

function updateChunkInfo(chunkSize: number): void {
  totalChunksSize += chunkSize;
  chunkCount++;

  const chunkInfoElement = document.getElementById("chunkInfo");
  if (chunkInfoElement) {
    chunkInfoElement.textContent = `청크: ${chunkCount}개, 총 크기: ${(
      totalChunksSize / 1024
    ).toFixed(2)} KB`;
  }
}

// ============================================
// 6. 페이지 로드 시 초기화
// ============================================

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    console.log("MediaRecorder 예제 준비 완료");

    // 지원하는 MIME 타입 출력
    const supportedTypes = getSupportedMimeTypes();
    console.log("지원하는 MIME 타입:", supportedTypes);

    const mimeTypeElement = document.getElementById("mimeType");
    if (mimeTypeElement) {
      mimeTypeElement.textContent = getBestAudioMimeType() || "기본값 사용";
    }

    updateUI("stopped");

    // 버튼 이벤트 리스너
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const pauseBtn = document.getElementById("pauseBtn");

    startBtn?.addEventListener("click", startRecording);
    stopBtn?.addEventListener("click", stopRecording);
    pauseBtn?.addEventListener("click", togglePause);
  });
}

// ============================================
// 7. 내보내기 (모듈 시스템 사용 시)
// ============================================

export {
  AudioRecorder,
  getSupportedMimeTypes,
  getBestAudioMimeType,
  startRecording,
  stopRecording,
  togglePause,
};
