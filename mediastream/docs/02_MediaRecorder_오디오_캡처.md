# Chapter 2: MediaRecorder로 오디오 캡처하기

## 📖 학습 목표

이 챕터를 완료하면 다음을 이해할 수 있습니다:

- MediaRecorder가 무엇인지, 왜 필요한지
- MediaRecorder를 생성하고 사용하는 방법
- 실시간으로 오디오 데이터를 청크 단위로 수집하는 방법
- MIME 타입과 코덱 선택 방법
- MediaRecorder의 생명주기와 상태 관리

---

## 2.1 MediaRecorder란 무엇인가?

### 개념 이해하기

**MediaRecorder**는 MediaStream에서 흐르는 오디오/비디오 데이터를 **실제로 수집하고 저장**하는 도구입니다.

일상 생활의 비유:

- **녹음기**: 실제 녹음기처럼 MediaStream의 데이터를 기록합니다.
- **비디오 카메라**: 영상을 촬영하듯이 스트림을 녹화합니다.
- **수집함**: 데이터를 모아서 나중에 사용할 수 있게 합니다.

### MediaRecorder의 역할

MediaRecorder는 다음과 같은 일을 합니다:

1. **데이터 수집**: MediaStream에서 오디오/비디오 데이터를 받아옵니다.
2. **인코딩**: 받은 데이터를 특정 형식(예: WebM, MP4)으로 변환합니다.
3. **청크 생성**: 데이터를 작은 단위(Blob)로 나누어 제공합니다.
4. **상태 관리**: 녹화 시작, 일시 정지, 재개, 정지 등을 관리합니다.

### MediaRecorder vs MediaStream

| 구분        | MediaStream              | MediaRecorder          |
| ----------- | ------------------------ | ---------------------- |
| 역할        | 데이터를 실시간으로 전달 | 데이터를 수집하고 저장 |
| 데이터 형태 | 실시간 스트림            | Blob (청크 단위)       |
| 저장 여부   | 저장하지 않음            | 수집하여 저장 가능     |
| 사용 목적   | 실시간 재생, 전송        | 녹화, 저장, 분석       |

---

## 2.2 MediaRecorder 생성하기

### 기본 생성

가장 간단한 형태로 MediaRecorder를 생성하는 방법입니다:

```typescript
// 1. MediaStream 가져오기 (Chapter 1에서 배운 내용)
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// 2. MediaRecorder 생성
const mediaRecorder = new MediaRecorder(stream);
```

### 생성자 옵션

MediaRecorder를 생성할 때 옵션을 지정할 수 있습니다:

```typescript
interface MediaRecorderOptions {
  mimeType?: string; // MIME 타입 (예: "audio/webm")
  audioBitsPerSecond?: number; // 오디오 비트레이트
  videoBitsPerSecond?: number; // 비디오 비트레이트
  bitsPerSecond?: number; // 전체 비트레이트
}

const options: MediaRecorderOptions = {
  mimeType: "audio/webm;codecs=opus",
  audioBitsPerSecond: 128000, // 128 kbps
};

const mediaRecorder = new MediaRecorder(stream, options);
```

### MIME 타입 확인

브라우저가 특정 MIME 타입을 지원하는지 확인할 수 있습니다:

```typescript
// 특정 MIME 타입 지원 여부 확인
if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
  console.log("WebM Opus 코덱을 지원합니다!");
  const recorder = new MediaRecorder(stream, {
    mimeType: "audio/webm;codecs=opus",
  });
} else {
  console.log("WebM Opus를 지원하지 않습니다. 기본 형식 사용");
  const recorder = new MediaRecorder(stream);
}
```

### 지원하는 MIME 타입 확인 함수

```typescript
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

// 사용 예제
const supportedTypes = getSupportedMimeTypes();
console.log("지원하는 형식:", supportedTypes);
```

---

## 2.3 MediaRecorder 생명주기

### 상태 (State)

MediaRecorder는 세 가지 상태를 가집니다:

1. **`inactive`**: 녹화가 시작되지 않았거나 정지된 상태
2. **`recording`**: 현재 녹화 중인 상태
3. **`paused`**: 일시 정지된 상태

```typescript
// 상태 확인
console.log(mediaRecorder.state); // "inactive" | "recording" | "paused"
```

### 상태 전이도

```
[inactive] --start()--> [recording] --pause()--> [paused]
                              |                        |
                              |                        |
                              +--stop()--> [inactive]--+
                              |                        |
                              +--pause()--> [paused]----+
```

### 메서드

MediaRecorder의 주요 메서드들:

- **`start(timeslice?)`**: 녹화 시작
- **`stop()`**: 녹화 정지
- **`pause()`**: 일시 정지
- **`resume()`**: 재개
- **`requestData()`**: 현재까지의 데이터 요청

---

## 2.4 녹화 시작하기

### 기본 시작

가장 간단한 방법으로 녹화를 시작합니다:

```typescript
const mediaRecorder = new MediaRecorder(stream);
mediaRecorder.start();
console.log("녹화 시작!", mediaRecorder.state); // "recording"
```

### Timeslice를 사용한 청크 단위 녹화

**Timeslice**는 데이터를 주기적으로 나누어 받는 간격(밀리초)입니다. 실시간 전송에 유용합니다:

```typescript
// 1초마다 데이터 청크를 받기
mediaRecorder.start(1000); // 1000ms = 1초

// 또는 100ms마다 (더 실시간에 가까움)
mediaRecorder.start(100); // 100ms = 0.1초
```

**Timeslice를 사용하는 이유**:

- 실시간 전송: 작은 청크로 나누어 WebSocket 등으로 전송 가능
- 메모리 관리: 큰 데이터를 한 번에 받지 않고 나누어 받음
- 진행 상황 추적: 주기적으로 데이터를 받아 진행 상황 확인 가능

### Timeslice 없이 녹화

Timeslice를 지정하지 않으면 녹화가 끝날 때까지 데이터를 받지 않습니다:

```typescript
mediaRecorder.start(); // timeslice 없음

// stop()을 호출할 때까지 dataavailable 이벤트가 발생하지 않음
// stop() 호출 시 마지막 dataavailable 이벤트 발생
```

> - start에 지정하면 데이터가 이용가능하다는 dataavailable 이벤트 발생

> -

---

## 2.5 데이터 수집하기: dataavailable 이벤트

### 이벤트 핸들러 등록

`dataavailable` 이벤트는 MediaRecorder가 데이터 청크를 생성할 때 발생합니다:

```typescript
const chunks: Blob[] = [];

mediaRecorder.ondataavailable = (event: BlobEvent) => {
  if (event.data && event.data.size > 0) {
    chunks.push(event.data);
    console.log("데이터 청크 수신:", event.data.size, "bytes");
  }
};
```

### 이벤트 발생 시점

`dataavailable` 이벤트는 다음 경우에 발생합니다:

1. **Timeslice 지정 시**: 지정한 간격마다 발생
2. **`requestData()` 호출 시**: 수동으로 요청할 때 발생
3. **`stop()` 호출 시**: 녹화 종료 시 마지막 데이터 발생

### 실시간 청크 수집 예제

```typescript
const chunks: Blob[] = [];

mediaRecorder.ondataavailable = (event: BlobEvent) => {
  if (event.data && event.data.size > 0) {
    chunks.push(event.data);

    // 실시간으로 처리 (예: WebSocket으로 전송)
    console.log(`청크 #${chunks.length} 수신:`, event.data.size, "bytes");

    // 여기서 WebSocket으로 전송할 수 있음 (Chapter 4에서 배움)
    // websocket.send(event.data);
  }
};

// 100ms마다 청크 수집
mediaRecorder.start(100);
```

---

## 2.6 녹화 정지하기

### stop() 메서드

`stop()` 메서드를 호출하면 녹화가 종료되고 마지막 `dataavailable` 이벤트가 발생합니다:

```typescript
mediaRecorder.stop();
console.log("녹화 정지!", mediaRecorder.state); // "inactive"
```

### stop 이벤트

녹화가 완전히 정지되면 `stop` 이벤트가 발생합니다:

```typescript
mediaRecorder.onstop = () => {
  console.log("녹화 완료!");

  // 모든 청크를 하나의 Blob으로 합치기
  const finalBlob = new Blob(chunks, {
    type: mediaRecorder.mimeType,
  });

  console.log("최종 Blob 크기:", finalBlob.size, "bytes");
  console.log("MIME 타입:", finalBlob.type);

  // 청크 배열 초기화
  chunks.length = 0;
};
```

### 완전한 녹화 예제

```typescript
async function recordAudio(duration: number): Promise<Blob> {
  // 1. 스트림 가져오기
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // 2. MediaRecorder 생성
  const mediaRecorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];

  // 3. 데이터 수집 준비
  mediaRecorder.ondataavailable = (event: BlobEvent) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  // 4. 녹화 완료 처리
  const recordingPromise = new Promise<Blob>((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
      resolve(blob);
    };
  });

  // 5. 녹화 시작
  mediaRecorder.start();

  // 6. 지정된 시간 후 정지
  setTimeout(() => {
    mediaRecorder.stop();
    // 스트림 정리
    stream.getTracks().forEach((track) => track.stop());
  }, duration);

  // 7. 완료된 Blob 반환
  return recordingPromise;
}

// 사용 예제: 5초 녹음
const audioBlob = await recordAudio(5000);
console.log("녹음 완료:", audioBlob.size, "bytes");
```

---

## 2.7 일시 정지와 재개

### pause()와 resume()

녹화 중 일시 정지하고 다시 재개할 수 있습니다:

```typescript
// 일시 정지
mediaRecorder.pause();
console.log("일시 정지:", mediaRecorder.state); // "paused"

// 재개
mediaRecorder.resume();
console.log("재개:", mediaRecorder.state); // "recording"
```

### pause/resume 이벤트

```typescript
mediaRecorder.onpause = () => {
  console.log("녹화가 일시 정지되었습니다.");
};

mediaRecorder.onresume = () => {
  console.log("녹화가 재개되었습니다.");
};
```

### 사용 예제

```typescript
let isPaused = false;

function togglePause(): void {
  if (mediaRecorder.state === "recording") {
    mediaRecorder.pause();
    isPaused = true;
  } else if (mediaRecorder.state === "paused") {
    mediaRecorder.resume();
    isPaused = false;
  }
}
```

---

## 2.8 MIME 타입과 코덱

### MIME 타입이란?

**MIME 타입**은 데이터의 형식을 나타내는 문자열입니다. MediaRecorder에서 사용하는 형식은 다음과 같습니다:

- **`audio/webm`**: WebM 오디오 형식 (기본값)
- **`audio/webm;codecs=opus`**: WebM 형식에 Opus 코덱 사용
- **`audio/ogg;codecs=opus`**: OGG 형식에 Opus 코덱 사용
- **`audio/mp4`**: MP4 오디오 형식

### 코덱이란?

**코덱**은 데이터를 압축하고 압축 해제하는 알고리즘입니다. 오디오 코덱의 예:

- **Opus**: 고품질 오디오 코덱, WebRTC에서 주로 사용
- **PCM**: 무압축 오디오 형식
- **AAC**: MP4에서 주로 사용하는 코덱

### MIME 타입 선택 가이드

```typescript
function getBestAudioMimeType(): string {
  // 우선순위에 따라 확인
  const preferredTypes = [
    "audio/webm;codecs=opus", // 최고 품질, 작은 파일 크기
    "audio/webm", // WebM 기본
    "audio/ogg;codecs=opus", // OGG Opus
    "audio/mp4", // MP4
  ];

  for (const mimeType of preferredTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  // 지원하는 형식이 없으면 기본값 사용
  return "";
}

// 사용 예제
const mimeType = getBestAudioMimeType();
const options = mimeType ? { mimeType } : {};
const mediaRecorder = new MediaRecorder(stream, options);
```

### 비트레이트 설정

오디오 품질을 조절하려면 비트레이트를 설정합니다:

```typescript
const options: MediaRecorderOptions = {
  mimeType: "audio/webm;codecs=opus",
  audioBitsPerSecond: 128000, // 128 kbps (고품질)
  // audioBitsPerSecond: 64000,  // 64 kbps (중품질)
  // audioBitsPerSecond: 32000,  // 32 kbps (저품질, 작은 파일)
};

const mediaRecorder = new MediaRecorder(stream, options);
```

**비트레이트 선택 가이드**:

- **128 kbps 이상**: 고품질 음악, 전문 녹음
- **64-128 kbps**: 일반 음성 녹음, 화상 회의
- **32-64 kbps**: 전화 품질, 실시간 전송 (대역폭 절약)

---

## 2.9 에러 처리

### error 이벤트

MediaRecorder에서 에러가 발생하면 `error` 이벤트가 발생합니다:

```typescript
mediaRecorder.onerror = (event: MediaRecorderErrorEvent) => {
  console.error("MediaRecorder 에러:", event.error);

  if (event.error instanceof DOMException) {
    switch (event.error.name) {
      case "InvalidStateError":
        console.error("잘못된 상태에서 작업을 시도했습니다.");
        break;
      case "NotSupportedError":
        console.error("지원하지 않는 형식입니다.");
        break;
      default:
        console.error("알 수 없는 에러:", event.error.message);
    }
  }
};
```

### 일반적인 에러

1. **InvalidStateError**: 잘못된 상태에서 메서드 호출 (예: 이미 정지된 상태에서 stop() 호출)
2. **NotSupportedError**: 지원하지 않는 MIME 타입 사용
3. **UnknownError**: 알 수 없는 에러

---

## 2.10 실전 예제: 완전한 오디오 녹음기

다음은 실제로 사용할 수 있는 완전한 예제입니다:

```typescript
interface AudioRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  timeslice?: number; // 실시간 청크 수집 간격 (ms)
}

class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private timeslice: number;

  constructor(private options: AudioRecorderOptions = {}) {
    this.timeslice = options.timeslice ?? 0;
  }

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

      console.log("녹음 시작!");
    } catch (error) {
      console.error("녹음 시작 실패:", error);
      throw error;
    }
  }

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

        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause();
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume();
    }
  }

  getChunks(): Blob[] {
    return [...this.chunks]; // 복사본 반환
  }

  private setupEventHandlers(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.chunks.push(event.data);
        console.log(
          `청크 수신: ${event.data.size} bytes (총 ${this.chunks.length}개)`
        );
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

    return ""; // 기본값 사용
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.chunks = [];
    this.mediaRecorder = null;
  }
}

// 사용 예제
async function example(): Promise<void> {
  const recorder = new AudioRecorder({
    mimeType: "audio/webm;codecs=opus",
    audioBitsPerSecond: 128000,
    timeslice: 100, // 100ms마다 청크 수집
  });

  try {
    await recorder.start();
    console.log("녹음 중...");

    // 5초 후 정지
    setTimeout(async () => {
      const blob = await recorder.stop();
      console.log("녹음 완료:", blob.size, "bytes");
    }, 5000);
  } catch (error) {
    console.error("에러:", error);
  }
}
```

---

## 2.11 요약

이 챕터에서 배운 내용:

1. **MediaRecorder**: MediaStream의 데이터를 수집하고 저장하는 도구
2. **생성**: MediaStream과 옵션을 전달하여 생성
3. **상태**: inactive, recording, paused 세 가지 상태
4. **메서드**: start(), stop(), pause(), resume()
5. **데이터 수집**: dataavailable 이벤트로 청크 단위 수집
6. **Timeslice**: 실시간 전송을 위한 주기적 데이터 수집
7. **MIME 타입**: 오디오 형식과 코덱 선택
8. **에러 처리**: error 이벤트로 에러 처리

---

## 2.12 다음 단계

다음 챕터에서는 수집한 Blob 데이터를 WebSocket으로 전송하기 위해 필요한 데이터 형식 변환(Blob → ArrayBuffer)을 배웁니다.

---

## 연습 문제

1. MediaRecorder를 사용하여 10초간 오디오를 녹음하는 함수를 작성하세요.
2. 100ms마다 데이터 청크를 수집하는 MediaRecorder를 만드세요.
3. 일시 정지/재개 기능이 있는 오디오 녹음기를 만드세요.

답안은 `codes/02_MediaRecorder_example.ts` 파일을 참고하세요.
