# Chapter 1: MediaStream 기초 퀴즈

이 퀴즈는 Chapter 1의 핵심 개념을 검증합니다. 각 문제를 풀어보며 학습한 내용을 확인하세요.

---

## 객관식 문제 (6문제)

### Q1. MediaStream의 특징으로 옳지 않은 것은?

1. 실시간으로 데이터가 흐른다
2. 하나 이상의 MediaStreamTrack을 포함한다
3. 데이터가 자동으로 저장된다
4. 오디오와 비디오 트랙을 독립적으로 관리할 수 있다

**정답**: 3

**해설**: MediaStream은 실시간 스트림으로, 자동으로 저장되지 않습니다. 저장하려면 MediaRecorder를 사용해야 합니다.

---

### Q2. getUserMedia()를 호출할 수 있는 환경은?

1. HTTP 페이지에서만 가능
2. HTTPS 또는 localhost에서만 가능
3. 모든 환경에서 가능
4. file:// 프로토콜에서는 불가능

**정답**: 2

**해설**: getUserMedia()는 Secure Context에서만 사용 가능합니다. HTTPS, localhost, file:// 프로토콜이 Secure Context에 해당합니다.

---

### Q3. 사용자가 마이크 권한을 거부했을 때 발생하는 에러는?

1. NotFoundError
2. NotReadableError
3. NotAllowedError
4. OverConstrainedError

**정답**: 3

**해설**: NotAllowedError는 사용자가 권한을 거부했을 때 발생합니다. NotFoundError는 장치가 없을 때, NotReadableError는 다른 프로그램이 사용 중일 때, OverConstrainedError는 제약 조건을 만족하는 장치가 없을 때 발생합니다.

---

### Q4. MediaStreamTrack의 enabled 속성을 false로 설정하면 어떻게 되는가?

1. 트랙이 완전히 중지된다
2. 트랙이 음소거된다 (데이터는 계속 생성됨)
3. 트랙이 삭제된다
4. 아무 변화가 없다

**정답**: 2

**해설**: enabled를 false로 설정하면 트랙이 음소거되지만, 데이터는 계속 생성됩니다. 완전히 중지하려면 stop() 메서드를 호출해야 합니다.

---

### Q5. 다음 Constraints 중 올바른 것은?

1. `{ audio: true, video: { width: 1280, height: 720 } }`
2. `{ audio: "true", video: { width: "1280" } }`
3. `{ audio: 1, video: { width: 1280 } }`
4. `{ audio: "yes", video: true }`

**정답**: 1

**해설**: Constraints에서 audio는 boolean 값(true/false)을, video는 객체 또는 boolean을 사용합니다. 숫자나 문자열을 사용하면 안 됩니다.

---

### Q6. MediaStream의 getTracks() 메서드가 반환하는 것은?

1. MediaStream 객체
2. MediaStreamTrack 배열
3. MediaStreamTrack 객체 하나
4. 문자열 배열

**정답**: 2

**해설**: getTracks()는 MediaStream에 포함된 모든 트랙을 배열로 반환합니다.

---

## 주관식 문제 (3문제)

### Q7. getUserMedia()를 호출할 때 사용자가 권한을 거부하면 발생하는 에러의 이름은?

**정답**: NotAllowedError

**해설**: DOMException의 하위 타입인 NotAllowedError가 발생합니다.

---

### Q8. MediaStream을 구성하는 개별 트랙을 나타내는 객체의 이름은?

**정답**: MediaStreamTrack

**해설**: MediaStream은 하나 이상의 MediaStreamTrack을 포함하며, 각 트랙은 오디오 또는 비디오 중 하나의 타입을 가집니다.

---

### Q9. getUserMedia()에서 원하는 미디어 조건을 지정하는 객체를 무엇이라고 하는가?

**정답**: Constraints 또는 MediaStreamConstraints

**해설**: Constraints 객체를 통해 오디오/비디오 요청 여부와 세부 설정을 지정할 수 있습니다.

---

## 코드 작성 문제 (4문제)

### Q10. 다음 코드의 빈칸을 채우세요.

```typescript
const stream = await navigator.mediaDevices.______({
  audio: true,
  video: { width: 1280 }
});
```

**정답**: getUserMedia

**해설**: navigator.mediaDevices.getUserMedia()를 사용하여 미디어 장치에 접근합니다.

---

### Q11. 다음 코드의 빈칸을 채우세요.

```typescript
async function requestMicrophone(): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        ______: true  // 자동 이득 제어
      }
    });
    return stream;
  } catch (error) {
    console.error("에러 발생:", error);
    throw error;
  }
}
```

**정답**: autoGainControl

**해설**: autoGainControl은 오디오 트랙의 자동 이득 제어 옵션입니다.

---

### Q12. 다음 코드에서 오류를 찾고 수정하세요.

```typescript
async function getStream() {
  const stream = navigator.mediaDevices.getUserMedia({ audio: true });
  console.log(stream.id);
  return stream;
}
```

**정답**:

```typescript
async function getStream() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  console.log(stream.id);
  return stream;
}
```

**해설**: getUserMedia()는 Promise를 반환하므로 await를 사용해야 합니다. await 없이 호출하면 Promise 객체가 반환되어 stream.id에 접근할 수 없습니다.

---

### Q13. 다음 요구사항을 만족하는 함수를 작성하세요.

- 함수명: `stopAllTracks`
- 매개변수: `stream: MediaStream`
- 기능: MediaStream의 모든 트랙을 중지

**정답**:

```typescript
function stopAllTracks(stream: MediaStream): void {
  stream.getTracks().forEach(track => {
    track.stop();
  });
}
```

**해설**: getTracks()로 모든 트랙을 가져온 후, forEach를 사용하여 각 트랙의 stop() 메서드를 호출합니다.

---

## 개념 설명 문제 (2문제)

### Q14. MediaStream과 MediaRecorder의 차이점을 설명하세요.

**정답**:

MediaStream은 실시간으로 오디오/비디오 데이터를 전달하는 스트림 객체입니다. 데이터를 저장하지 않고 실시간으로 전달만 합니다.

MediaRecorder는 MediaStream에서 흐르는 데이터를 수집하고 인코딩하여 Blob 형태로 저장하는 도구입니다. MediaStream의 데이터를 실제로 기록하고 저장하는 역할을 합니다.

**요약**: MediaStream은 데이터 전달, MediaRecorder는 데이터 수집 및 저장

---

### Q15. Secure Context가 무엇이며, 왜 getUserMedia()는 Secure Context에서만 사용 가능한가?

**정답**:

Secure Context는 HTTPS, localhost, file:// 프로토콜로 접근하는 환경을 의미합니다.

getUserMedia()는 사용자의 마이크/카메라 같은 민감한 하드웨어에 접근하는 API이므로, 보안을 위해 Secure Context에서만 사용할 수 있도록 제한되어 있습니다. 이를 통해 악의적인 사이트가 사용자의 미디어 장치에 무단으로 접근하는 것을 방지할 수 있습니다.

**해설**: 보안상의 이유로 민감한 API는 Secure Context에서만 동작하도록 설계되었습니다.

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

