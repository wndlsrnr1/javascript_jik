# Chapter 1: MediaStream과 getUserMedia 기초

## 📖 학습 목표

이 챕터를 완료하면 다음을 이해할 수 있습니다:

- MediaStream이 무엇인지, 왜 필요한지
- getUserMedia()를 사용하여 마이크에 접근하는 방법
- Constraints를 통해 원하는 미디어를 요청하는 방법
- 발생할 수 있는 에러와 처리 방법

---

## 1.1 MediaStream이란 무엇인가?

### 개념 이해하기

**MediaStream**은 브라우저에서 오디오나 비디오 데이터를 실시간으로 전달하는 "파이프"라고 생각하면 됩니다. 

일상 생활의 비유를 들어보면:
- **수도관**: 물이 흐르는 파이프처럼, MediaStream은 오디오/비디오 데이터가 흐르는 통로입니다.
- **TV 방송**: 실시간으로 방송되는 프로그램처럼, MediaStream은 실시간으로 데이터를 전달합니다.
- **전화 통화**: 통화 중 음성이 실시간으로 전달되듯이, MediaStream은 데이터를 연속적으로 전달합니다.

### 기술적 정의

MediaStream은 **하나 이상의 미디어 트랙(MediaStreamTrack)**을 포함하는 객체입니다. 각 트랙은 오디오나 비디오 중 하나의 타입을 가집니다.

```typescript
// MediaStream의 구조 (개념적 표현)
interface MediaStream {
  id: string;                    // 스트림의 고유 식별자
  active: boolean;               // 스트림이 활성화되어 있는지
  getTracks(): MediaStreamTrack[]; // 포함된 트랙들 가져오기
}
```

### MediaStream의 특징

1. **실시간성**: 데이터가 연속적으로 흐릅니다. 파일처럼 저장된 것이 아닙니다.
2. **트랙 기반**: 오디오 트랙과 비디오 트랙을 독립적으로 관리할 수 있습니다.
3. **일회성**: 한 번 흐른 데이터는 다시 볼 수 없습니다. (녹화하지 않는 한)

---

## 1.2 getUserMedia()로 마이크 접근하기

### getUserMedia()란?

`getUserMedia()`는 브라우저에게 "사용자의 마이크나 카메라를 사용하고 싶다"고 요청하는 함수입니다. 사용자의 허가를 받아야만 사용할 수 있습니다.

### 기본 사용법

가장 간단한 형태로 오디오만 요청하는 예제입니다:

```typescript
async function requestMicrophone(): Promise<MediaStream> {
  try {
    // 오디오만 요청
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    
    console.log('마이크 접근 성공!', stream);
    return stream;
  } catch (error) {
    console.error('마이크 접근 실패:', error);
    throw error;
  }
}
```

### 코드 설명

1. **`navigator.mediaDevices`**: 브라우저의 미디어 장치에 접근하는 인터페이스입니다.
2. **`getUserMedia()`**: 미디어 장치 사용 권한을 요청하는 메서드입니다.
3. **`{ audio: true }`**: Constraints 객체로, 오디오를 요청한다는 의미입니다.
4. **`await`**: 비동기 작업이므로 Promise가 완료될 때까지 기다립니다.

### 동기식 vs 비동기식

`getUserMedia()`는 사용자의 허가를 기다려야 하므로 비동기 함수입니다. 두 가지 방식으로 사용할 수 있습니다:

**방법 1: async/await (권장)**
```typescript
async function getStream() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // stream 사용
}
```

**방법 2: Promise.then()**
```typescript
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    // stream 사용
  })
  .catch((error) => {
    // 에러 처리
  });
```

---

## 1.3 Constraints로 원하는 미디어 요청하기

### Constraints란?

**Constraints**는 "제약 조건"이라는 뜻으로, 어떤 종류의 미디어를 원하는지, 어떤 품질을 원하는지를 브라우저에 알려주는 객체입니다.

### 기본 Constraints

가장 간단한 형태는 `true` 또는 `false`를 사용하는 것입니다:

```typescript
// 오디오만 요청
const constraints1 = { audio: true };

// 비디오만 요청
const constraints2 = { video: true };

// 오디오와 비디오 모두 요청
const constraints3 = { audio: true, video: true };

// 아무것도 요청하지 않음 (에러 발생)
const constraints4 = {}; // ❌ 에러!
```

### 상세한 Constraints

더 구체적인 요구사항을 지정할 수 있습니다:

```typescript
// 오디오만, 하지만 고품질로
const audioConstraints = {
  audio: {
    echoCancellation: true,    // 에코 제거 활성화
    noiseSuppression: true,    // 노이즈 제거 활성화
    autoGainControl: true,     // 자동 볼륨 조절
  },
};

// 비디오도 함께, 특정 해상도로
const videoConstraints = {
  audio: true,
  video: {
    width: { ideal: 1280 },     // 이상적인 너비
    height: { ideal: 720 },     // 이상적인 높이
    facingMode: 'user',        // 전면 카메라 (모바일)
  },
};
```

### Constraints의 키워드

Constraints에서 사용할 수 있는 키워드들:

- **`ideal`**: 이상적인 값. 가능하면 이 값으로 설정하되, 불가능하면 다른 값도 허용합니다.
- **`min`**: 최소값. 이 값보다 작으면 안 됩니다.
- **`max`**: 최대값. 이 값보다 크면 안 됩니다.
- **`exact`**: 정확한 값. 이 값이 아니면 에러가 발생합니다.

```typescript
// 이상적인 해상도 (유연함)
const flexible = {
  video: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
};

// 최소 해상도 요구 (엄격함)
const strict = {
  video: {
    width: { min: 1280 },
    height: { min: 720 },
  },
};

// 정확한 해상도만 허용 (매우 엄격함)
const exact = {
  video: {
    width: { exact: 1920 },
    height: { exact: 1080 },
  },
};
```

---

## 1.4 보안 요구사항

### Secure Context (보안 컨텍스트)

`getUserMedia()`는 **보안이 중요한 기능**이므로, 반드시 **Secure Context**에서만 사용할 수 있습니다.

Secure Context란:
- **HTTPS**로 접속한 페이지
- **localhost**에서 실행되는 페이지
- **file://** 프로토콜로 열린 파일

❌ **안전하지 않은 경우**:
```typescript
// HTTP로 접속한 페이지에서는 작동하지 않음
// http://example.com ❌
```

✅ **안전한 경우**:
```typescript
// HTTPS로 접속한 페이지
// https://example.com ✅

// localhost
// http://localhost:3000 ✅

// file:// 프로토콜
// file:///Users/name/index.html ✅
```

### 사용자 권한

브라우저는 사용자에게 마이크/카메라 사용 권한을 요청합니다:

1. **첫 번째 요청**: 브라우저가 사용자에게 권한을 요청합니다.
2. **허용**: 사용자가 허용하면 해당 도메인에서 계속 사용할 수 있습니다.
3. **거부**: 사용자가 거부하면 `NotAllowedError`가 발생합니다.

### 권한 확인하기

현재 권한 상태를 확인할 수 있습니다:

```typescript
async function checkPermission(): Promise<PermissionState> {
  const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
  return result.state; // 'granted', 'denied', 'prompt'
}
```

---

## 1.5 에러 처리

### 발생할 수 있는 에러들

`getUserMedia()`는 여러 가지 이유로 실패할 수 있습니다. 각 에러를 적절히 처리해야 합니다.

#### 1. NotAllowedError - 권한 거부

사용자가 마이크/카메라 사용을 거부했을 때 발생합니다.

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error) {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    console.error('사용자가 마이크 사용을 거부했습니다.');
    // 사용자에게 권한이 필요하다고 안내
  }
}
```

**해결 방법**:
- 사용자에게 권한이 왜 필요한지 설명
- 브라우저 설정에서 권한을 허용하도록 안내

#### 2. NotFoundError - 장치 없음

요청한 미디어 장치가 없을 때 발생합니다.

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error) {
  if (error instanceof DOMException && error.name === 'NotFoundError') {
    console.error('마이크를 찾을 수 없습니다.');
    // 사용자에게 마이크를 연결하도록 안내
  }
}
```

**해결 방법**:
- 마이크가 연결되어 있는지 확인
- 다른 마이크를 선택하도록 안내

#### 3. NotReadableError - 장치 사용 중

다른 애플리케이션이 마이크를 사용 중일 때 발생합니다.

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error) {
  if (error instanceof DOMException && error.name === 'NotReadableError') {
    console.error('마이크가 다른 프로그램에서 사용 중입니다.');
    // 사용자에게 다른 프로그램을 종료하도록 안내
  }
}
```

**해결 방법**:
- 다른 애플리케이션에서 마이크를 사용하고 있는지 확인
- 해당 애플리케이션을 종료

#### 4. OverconstrainedError - 제약 조건 불만족

요청한 Constraints를 만족하는 장치가 없을 때 발생합니다.

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { exact: 9999 }, height: { exact: 9999 } },
  });
} catch (error) {
  if (error instanceof DOMException && error.name === 'OverconstrainedError') {
    console.error('요청한 해상도를 지원하는 카메라가 없습니다.');
    // 더 낮은 해상도로 재시도
  }
}
```

**해결 방법**:
- Constraints를 완화 (exact → ideal 또는 min/max)
- 사용 가능한 장치 목록 확인 후 적절한 값 선택

#### 5. TypeError - Secure Context 아님

HTTP 페이지에서 호출했을 때 발생합니다.

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error) {
  if (error instanceof TypeError) {
    console.error('보안 컨텍스트가 아닙니다. HTTPS를 사용하세요.');
    // HTTPS로 리다이렉트하거나 안내
  }
}
```

**해결 방법**:
- HTTPS로 접속
- localhost에서 테스트

### 통합 에러 처리 함수

모든 에러를 한 곳에서 처리하는 함수 예제:

```typescript
function handleGetUserMediaError(error: unknown): void {
  if (!(error instanceof DOMException)) {
    console.error('알 수 없는 에러:', error);
    return;
  }

  switch (error.name) {
    case 'NotAllowedError':
      alert('마이크 사용 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요.');
      break;
    case 'NotFoundError':
      alert('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
      break;
    case 'NotReadableError':
      alert('마이크가 다른 프로그램에서 사용 중입니다. 다른 프로그램을 종료해주세요.');
      break;
    case 'OverconstrainedError':
      alert('요청한 설정을 지원하지 않는 마이크입니다.');
      break;
    default:
      console.error('getUserMedia 에러:', error.name, error.message);
  }
}

// 사용 예제
async function getStream(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    handleGetUserMediaError(error);
    return null;
  }
}
```

---

## 1.6 실전 예제: 마이크 접근하기

다음은 실제로 사용할 수 있는 완전한 예제입니다:

```typescript
interface MicrophoneAccessOptions {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

async function requestMicrophoneAccess(
  options: MicrophoneAccessOptions = {}
): Promise<MediaStream | null> {
  // 1. getUserMedia 지원 확인
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('이 브라우저는 getUserMedia를 지원하지 않습니다.');
    return null;
  }

  // 2. Constraints 설정
  const constraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: options.echoCancellation ?? true,
      noiseSuppression: options.noiseSuppression ?? true,
      autoGainControl: options.autoGainControl ?? true,
    },
  };

  // 3. 마이크 접근 시도
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('마이크 접근 성공!', stream);
    
    // 4. 스트림 정보 출력
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
      console.log('오디오 트랙:', {
        id: track.id,
        label: track.label,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
      });
    });

    return stream;
  } catch (error) {
    handleGetUserMediaError(error);
    return null;
  }
}

// 사용 예제
async function startRecording(): Promise<void> {
  const stream = await requestMicrophoneAccess({
    echoCancellation: true,
    noiseSuppression: true,
  });

  if (stream) {
    // 스트림을 사용하여 녹음 시작
    console.log('녹음 준비 완료!');
  }
}
```

---

## 1.7 스트림 정리하기

중요한 것은 **사용이 끝난 스트림을 정리**하는 것입니다. 그렇지 않으면 마이크가 계속 활성화되어 있을 수 있습니다.

### 트랙 정지하기

```typescript
function stopStream(stream: MediaStream): void {
  // 모든 트랙을 정지
  stream.getTracks().forEach((track) => {
    track.stop();
    console.log('트랙 정지:', track.kind, track.id);
  });
}

// 사용 예제
async function recordAndStop(): Promise<void> {
  const stream = await requestMicrophoneAccess();
  
  if (stream) {
    // 녹음 작업 수행...
    
    // 작업 완료 후 정리
    stopStream(stream);
  }
}
```

### 트랙 활성화/비활성화

트랙을 완전히 정지하지 않고 일시적으로 끌 수도 있습니다:

```typescript
function muteMicrophone(stream: MediaStream): void {
  stream.getAudioTracks().forEach((track) => {
    track.enabled = false; // 트랙 비활성화 (일시 정지)
  });
}

function unmuteMicrophone(stream: MediaStream): void {
  stream.getAudioTracks().forEach((track) => {
    track.enabled = true; // 트랙 활성화 (재개)
  });
}
```

---

## 1.8 요약

이 챕터에서 배운 내용:

1. **MediaStream**: 실시간 오디오/비디오 데이터를 전달하는 통로
2. **getUserMedia()**: 마이크/카메라 접근을 요청하는 함수
3. **Constraints**: 원하는 미디어의 종류와 품질을 지정
4. **보안**: Secure Context에서만 사용 가능, 사용자 권한 필요
5. **에러 처리**: 다양한 에러 상황에 대한 처리 방법
6. **스트림 정리**: 사용 후 반드시 정리해야 함

---

## 1.9 다음 단계

다음 챕터에서는 MediaRecorder를 사용하여 MediaStream의 오디오 데이터를 실제로 수집하는 방법을 배웁니다.

---

## 연습 문제

1. getUserMedia()를 사용하여 오디오만 요청하는 함수를 작성하세요.
2. 에러 처리를 포함한 완전한 마이크 접근 함수를 작성하세요.
3. 스트림을 정리하는 함수를 작성하세요.

답안은 `codes/01_getUserMedia_example.ts` 파일을 참고하세요.

