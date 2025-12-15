# Chapter 4: WebSocket 퀴즈

이 퀴즈는 Chapter 4의 핵심 개념을 검증합니다. WebSocket 연결, 실시간 전송, 연결 상태 관리 개념을 확인하세요.

---

## 객관식 문제 (6문제)

### Q1. WebSocket과 HTTP의 차이점으로 옳지 않은 것은?

1. HTTP는 요청-응답 방식, WebSocket은 양방향 통신
2. HTTP는 매번 새로 연결, WebSocket은 연결 유지
3. HTTP는 실시간 통신에 적합, WebSocket은 실시간 통신에 부적합
4. HTTP는 헤더 오버헤드가 큼, WebSocket은 연결 시 한 번만

**정답**: 3

**해설**: WebSocket이 실시간 통신에 적합하며, HTTP는 폴링을 사용해야 하므로 실시간 통신에 부적합합니다.

---

### Q2. WebSocket의 readyState 값 중 연결이 완전히 열린 상태는?

1. CONNECTING (0)
2. OPEN (1)
3. CLOSING (2)
4. CLOSED (3)

**정답**: 2

**해설**: WebSocket.OPEN은 1이며, 연결이 완전히 열려 데이터를 주고받을 수 있는 상태입니다.

---

### Q3. 다음 중 WebSocket으로 전송할 수 없는 데이터 타입은?

1. string
2. ArrayBuffer
3. Blob
4. Object (직접)

**정답**: 4

**해설**: WebSocket.send()는 string, ArrayBuffer, Blob, TypedArray를 받을 수 있지만, 객체를 직접 전송할 수는 없습니다. 객체를 전송하려면 JSON.stringify()로 변환해야 합니다.

---

### Q4. WebSocket 연결이 정상적으로 종료되었는지 확인하는 속성은?

1. code
2. reason
3. wasClean
4. readyState

**정답**: 3

**해설**: wasClean은 boolean 값으로, true면 정상 종료, false면 비정상 종료를 의미합니다.

---

### Q5. 프로덕션 환경에서 사용해야 하는 WebSocket 프로토콜은?

1. ws://
2. wss://
3. http://
4. https://

**정답**: 2

**해설**: wss:// (WebSocket Secure)는 암호화된 연결로, 프로덕션 환경에서는 보안을 위해 반드시 사용해야 합니다.

---

### Q6. WebSocket의 onmessage 이벤트에서 이진 데이터를 받을 때 event.data의 타입은?

1. string
2. ArrayBuffer
3. Blob
4. string 또는 ArrayBuffer

**정답**: 4

**해설**: onmessage 이벤트의 event.data는 전송된 데이터 타입에 따라 string 또는 ArrayBuffer가 될 수 있습니다.

---

## 주관식 문제 (3문제)

### Q7. WebSocket 연결이 닫힐 때 전달되는 상태 코드를 나타내는 속성 이름은?

**정답**: code

**해설**: WebSocket의 close 이벤트에서 event.code로 상태 코드를 확인할 수 있습니다. 정상 종료는 1000입니다.

---

### Q8. WebSocket 연결이 닫힌 이유를 나타내는 문자열 속성 이름은?

**정답**: reason

**해설**: WebSocket의 close 이벤트에서 event.reason으로 종료 사유를 확인할 수 있습니다.

---

### Q9. 바이너리 데이터를 Base64 인코딩된 문자열로 변환하는 함수 이름은?

**정답**: btoa

**해설**: btoa()는 Binary to ASCII의 약자로, 바이너리 데이터를 Base64 문자열로 변환합니다.

---

## 코드 작성 문제 (4문제)

### Q10. 다음 코드의 빈칸을 채우세요.

```typescript
const ws = new WebSocket("ws://localhost:8000/ws/audio/");

ws.______ = (event) => {
  if (event.data instanceof ArrayBuffer) {
    console.log("이진 데이터 수신:", event.data.byteLength);
  } else {
    console.log("텍스트 메시지 수신:", event.data);
  }
};
```

**정답**: onmessage

**해설**: onmessage 이벤트 핸들러를 설정하여 WebSocket에서 메시지를 수신할 수 있습니다.

---

### Q11. 다음 코드의 빈칸을 채우세요.

```typescript
const ws = new WebSocket("wss://example.com/ws/");

ws.onopen = () => {
  console.log("연결됨");
  
  if (ws.______ === WebSocket.OPEN) {
    ws.send("Hello");
  }
};
```

**정답**: readyState

**해설**: readyState 속성으로 WebSocket의 현재 연결 상태를 확인할 수 있습니다.

---

### Q12. 다음 요구사항을 만족하는 함수를 작성하세요.

- 함수명: `sendAudioChunk`
- 매개변수: `ws: WebSocket, audioBuffer: ArrayBuffer`
- 기능: 
  1. WebSocket이 연결되어 있는지 확인
  2. 연결되어 있으면 ArrayBuffer 전송
  3. 연결되어 있지 않으면 false 반환, 연결되어 있으면 true 반환

**정답**:

```typescript
function sendAudioChunk(ws: WebSocket, audioBuffer: ArrayBuffer): boolean {
  if (ws.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket이 연결되지 않았습니다.");
    return false;
  }
  
  try {
    ws.send(audioBuffer);
    return true;
  } catch (error) {
    console.error("전송 실패:", error);
    return false;
  }
}
```

**해설**: readyState를 확인하여 연결 상태를 체크하고, 연결되어 있을 때만 전송합니다.

---

### Q13. 다음 요구사항을 만족하는 재연결 로직을 작성하세요.

- 함수명: `createReconnectingWebSocket`
- 매개변수: `url: string, maxRetries: number = 5`
- 반환값: `WebSocket`
- 기능:
  1. WebSocket 연결 생성
  2. 연결이 끊어지면 자동으로 재연결 시도
  3. 최대 재시도 횟수 제한
  4. 재시도 간격은 지수 백오프 (1초, 2초, 4초, ...)

**정답**:

```typescript
function createReconnectingWebSocket(
  url: string,
  maxRetries: number = 5
): WebSocket {
  let retryCount = 0;
  let ws: WebSocket;

  function connect(): WebSocket {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket 연결 성공");
      retryCount = 0; // 성공 시 재시도 카운트 리셋
    };

    ws.onclose = (event) => {
      console.log("WebSocket 연결 종료:", event.code, event.reason);

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // 지수 백오프
        console.log(`${delay}ms 후 재연결 시도... (${retryCount + 1}/${maxRetries})`);

        setTimeout(() => {
          retryCount++;
          connect();
        }, delay);
      } else {
        console.error("최대 재시도 횟수에 도달했습니다.");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket 에러:", error);
    };

    return ws;
  }

  return connect();
}
```

**해설**: onclose 이벤트에서 재연결 로직을 구현하고, 지수 백오프를 사용하여 재시도 간격을 점진적으로 증가시킵니다.

---

## 개념 설명 문제 (2문제)

### Q14. WebSocket과 HTTP의 차이점을 설명하고, 실시간 오디오 스트리밍에 WebSocket이 적합한 이유를 설명하세요.

**정답**:

**WebSocket과 HTTP의 차이점**:

1. **연결 방식**:
   - HTTP: 요청-응답 방식 (단방향), 매번 새로 연결
   - WebSocket: 지속적 연결 (양방향), 한 번 연결 후 유지

2. **실시간성**:
   - HTTP: 폴링 필요, 지연시간 큼
   - WebSocket: 즉시 전송, 낮은 지연시간

3. **오버헤드**:
   - HTTP: 매 요청마다 헤더 전송
   - WebSocket: 연결 시 한 번만, 이후 최소 오버헤드

4. **서버 푸시**:
   - HTTP: 불가능 (폴링으로 시뮬레이션)
   - WebSocket: 가능 (서버가 직접 전송)

**실시간 오디오 스트리밍에 적합한 이유**:

1. **낮은 지연시간**: 연결이 유지되어 즉시 전송 가능
2. **양방향 통신**: 서버가 클라이언트에게 직접 응답 전송 가능
3. **이진 데이터 지원**: ArrayBuffer를 직접 전송하여 효율적
4. **연결 유지**: 매번 연결을 새로 만들 필요 없어 오버헤드 최소화

**해설**: 실시간 스트리밍에서는 지연시간이 가장 중요하며, WebSocket은 이를 최소화할 수 있습니다.

---

### Q15. WebSocket의 readyState 값들과 각 상태에서 할 수 있는 작업을 설명하세요.

**정답**:

**WebSocket.readyState 값들**:

1. **CONNECTING (0)**: 연결 중
   - 할 수 있는 작업: 없음 (대기)
   - 설명: WebSocket 객체가 생성되었지만 아직 연결되지 않은 상태

2. **OPEN (1)**: 연결됨
   - 할 수 있는 작업: send()로 데이터 전송, onmessage로 데이터 수신
   - 설명: 연결이 완전히 열려 데이터를 주고받을 수 있는 상태

3. **CLOSING (2)**: 닫는 중
   - 할 수 있는 작업: 없음 (대기)
   - 설명: close()가 호출되었거나 연결이 닫히는 중인 상태

4. **CLOSED (3)**: 닫힘
   - 할 수 있는 작업: 없음 (새로운 WebSocket 객체 생성 필요)
   - 설명: 연결이 완전히 닫힌 상태

**상태 확인 예제**:

```typescript
if (ws.readyState === WebSocket.OPEN) {
  ws.send(data); // 안전하게 전송 가능
}
```

**해설**: readyState를 확인하여 안전하게 데이터를 전송할 수 있습니다.

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

