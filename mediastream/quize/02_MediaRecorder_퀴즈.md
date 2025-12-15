# Chapter 2: MediaRecorder 퀴즈

이 퀴즈는 Chapter 2의 핵심 개념을 검증합니다. MediaRecorder API 사용법과 오디오 캡처 개념을 확인하세요.

---

## 객관식 문제 (6문제)

### Q1. MediaRecorder의 역할로 옳지 않은 것은?

1. MediaStream의 데이터를 수집한다
2. 데이터를 특정 형식으로 인코딩한다
3. 데이터를 Blob 형태로 제공한다
4. MediaStream을 제어한다 (시작/중지)

**정답**: 4

**해설**: MediaRecorder는 MediaStream의 데이터를 수집하고 인코딩할 뿐, MediaStream 자체를 제어하지는 않습니다. MediaStream 제어는 MediaStreamTrack의 stop() 메서드를 사용해야 합니다.

---

### Q2. MediaRecorder의 상태 중 녹화가 진행 중인 상태는?

1. inactive
2. recording
3. paused
4. stopped

**정답**: 2

**해설**: MediaRecorder의 상태는 inactive(초기), recording(녹화 중), paused(일시 정지) 세 가지입니다. stopped는 공식 상태가 아닙니다.

---

### Q3. 다음 MIME 타입 중 MediaRecorder가 가장 널리 지원하는 것은?

1. audio/mp4
2. audio/webm;codecs=opus
3. audio/wav
4. audio/flac

**정답**: 2

**해설**: audio/webm;codecs=opus는 대부분의 모던 브라우저에서 지원하며, 실시간 오디오 스트리밍에 적합합니다.

---

### Q4. MediaRecorder.isTypeSupported()의 반환값은?

1. Promise<boolean>
2. boolean
3. string
4. MediaRecorderOptions

**정답**: 2

**해설**: isTypeSupported()는 정적 메서드로 동기적으로 boolean 값을 반환합니다.

---

### Q5. ondataavailable 이벤트가 발생하는 시점으로 옳지 않은 것은?

1. start() 호출 시 timeslice를 지정한 경우 주기적으로 발생
2. stop() 호출 시 마지막 데이터 청크를 받기 위해 발생
3. pause() 호출 시 즉시 발생
4. requestData() 호출 시 즉시 발생

**정답**: 3

**해설**: pause() 호출 시에는 ondataavailable 이벤트가 발생하지 않습니다. pause()는 단순히 녹화를 일시 정지할 뿐입니다.

---

### Q6. 다음 코덱 중 압축되지 않은 원시 오디오 데이터 형식은?

1. opus
2. PCM
3. AAC
4. MP3

**정답**: 2

**해설**: PCM(Pulse Code Modulation)은 압축되지 않은 원시 오디오 데이터 형식입니다. opus, AAC, MP3는 모두 압축 코덱입니다.

---

## 주관식 문제 (3문제)

### Q7. MediaRecorder를 생성할 때 전달하는 옵션 객체의 타입 이름은?

**정답**: MediaRecorderOptions

**해설**: MediaRecorder 생성자의 두 번째 인자로 MediaRecorderOptions 타입의 객체를 전달합니다.

---

### Q8. MediaRecorder가 데이터 청크를 생성할 때 발생하는 이벤트의 이름은?

**정답**: ondataavailable 또는 dataavailable

**해설**: MediaRecorder가 데이터를 수집하여 Blob으로 만들 때 ondataavailable 이벤트가 발생합니다.

---

### Q9. MediaRecorder의 초기 상태를 나타내는 문자열은?

**정답**: inactive

**해설**: MediaRecorder는 생성 직후 inactive 상태이며, start()를 호출하면 recording 상태로 전환됩니다.

---

## 코드 작성 문제 (4문제)

### Q10. 다음 코드의 빈칸을 채우세요.

```typescript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new ______(stream, {
  mimeType: "audio/webm;codecs=opus"
});
```

**정답**: MediaRecorder

**해설**: MediaRecorder 생성자를 사용하여 MediaStream과 옵션을 전달합니다.

---

### Q11. 다음 코드의 빈칸을 채우세요.

```typescript
if (MediaRecorder.______("audio/webm;codecs=opus")) {
  const recorder = new MediaRecorder(stream, {
    mimeType: "audio/webm;codecs=opus"
  });
} else {
  console.log("지원하지 않는 형식입니다.");
}
```

**정답**: isTypeSupported

**해설**: isTypeSupported() 정적 메서드로 특정 MIME 타입 지원 여부를 확인할 수 있습니다.

---

### Q12. 다음 코드에서 오류를 찾고 수정하세요.

```typescript
const mediaRecorder = new MediaRecorder(stream);
mediaRecorder.ondataavailable = (event) => {
  console.log("데이터 수신:", event.data);
};

mediaRecorder.start();
mediaRecorder.pause();
mediaRecorder.resume();
mediaRecorder.stop();

// 데이터를 받기 위해
const blob = await mediaRecorder.requestData();
```

**정답**:

```typescript
const mediaRecorder = new MediaRecorder(stream);
mediaRecorder.ondataavailable = (event) => {
  console.log("데이터 수신:", event.data);
};

mediaRecorder.start(100); // timeslice 지정
mediaRecorder.pause();
mediaRecorder.resume();
mediaRecorder.stop();

// requestData()는 존재하지 않음
// ondataavailable 이벤트로 데이터를 받아야 함
```

**해설**: 
1. requestData() 메서드는 존재하지 않습니다. 데이터는 ondataavailable 이벤트를 통해 받습니다.
2. start()에 timeslice를 지정하면 주기적으로 데이터를 받을 수 있습니다.
3. stop() 호출 시 마지막 데이터 청크가 ondataavailable 이벤트로 전달됩니다.

---

### Q13. 다음 요구사항을 만족하는 함수를 작성하세요.

- 함수명: `createRecorderWithFallback`
- 매개변수: `stream: MediaStream`
- 기능: 
  1. "audio/webm;codecs=opus" 형식을 먼저 시도
  2. 지원하지 않으면 "audio/webm" 시도
  3. 그것도 지원하지 않으면 기본 형식 사용
  4. MediaRecorder 인스턴스 반환

**정답**:

```typescript
function createRecorderWithFallback(stream: MediaStream): MediaRecorder {
  const preferredTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
  ];

  for (const mimeType of preferredTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return new MediaRecorder(stream, { mimeType });
    }
  }

  // 기본 형식 사용
  return new MediaRecorder(stream);
}
```

**해설**: isTypeSupported()로 지원 여부를 확인한 후, 지원하는 형식 중 가장 선호하는 형식을 사용합니다.

---

## 개념 설명 문제 (2문제)

### Q14. MediaRecorder가 MediaStream에 대한 제어권을 가지지 않는다는 것은 무엇을 의미하는가?

**정답**:

MediaRecorder는 MediaStream의 데이터를 수집하고 인코딩할 뿐, MediaStream 자체를 제어(시작/중지)하지는 않습니다.

구체적으로:
- MediaRecorder.start()는 녹화를 시작하지만, MediaStream의 데이터 흐름을 시작하지는 않습니다.
- MediaRecorder.stop()은 녹화를 중지하지만, MediaStream의 데이터 흐름을 중지하지는 않습니다.
- MediaStream을 중지하려면 MediaStreamTrack의 stop() 메서드를 사용해야 합니다.

**해설**: 이는 MediaRecorder가 MediaStream의 "관찰자" 역할을 하며, 스트림 자체를 소유하지 않는다는 의미입니다.

---

### Q15. MIME 타입과 코덱의 관계를 설명하고, 실시간 오디오 스트리밍에 적합한 조합을 제시하세요.

**정답**:

**MIME 타입**은 데이터의 컨테이너 형식을 나타냅니다 (예: audio/webm, audio/mp4).
**코덱**은 데이터를 압축/압축 해제하는 알고리즘입니다 (예: opus, PCM, AAC).

MIME 타입은 코덱 정보를 포함할 수 있습니다:
- `audio/webm` - WebM 컨테이너, 기본 코덱 사용
- `audio/webm;codecs=opus` - WebM 컨테이너, Opus 코덱 사용

**실시간 오디오 스트리밍에 적합한 조합**:
- `audio/webm;codecs=opus` - 낮은 지연시간, 우수한 압축률, 넓은 브라우저 지원
- 이유: Opus는 실시간 통신에 최적화된 코덱이며, WebM은 스트리밍에 적합한 컨테이너입니다.

**해설**: 실시간 스트리밍에서는 지연시간이 중요하므로, opus 코덱과 webm 컨테이너의 조합이 가장 적합합니다.

---

## 정답 확인

모든 문제를 푼 후, 각 문제의 정답과 해설을 확인하여 학습한 내용을 점검하세요.

**점수 계산**:
- 객관식: 각 5점 (총 30점)
- 주관식: 각 5점 (총 15점)
- 코드 작성: 각 10점 (총 40점)
- 개념 설명: 각 7.5점 (총 15점)
- **총점: 100점**

**합격 기준**: 70점 이상

