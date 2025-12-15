# Chapter 3: Blob과 ArrayBuffer 퀴즈

이 퀴즈는 Chapter 3의 핵심 개념을 검증합니다. Blob과 ArrayBuffer의 차이, 데이터 변환, 메모리 관리 개념을 확인하세요.

---

## 객관식 문제 (6문제)

### Q1. Blob의 특징으로 옳지 않은 것은?

1. 불변(immutable) 객체이다
2. MIME 타입 정보를 가질 수 있다
3. 생성 후 내용을 수정할 수 있다
4. 크기 정보를 가진다

**정답**: 3

**해설**: Blob은 불변 객체이므로 생성 후 내용을 수정할 수 없습니다. 수정이 필요하면 새로운 Blob을 생성해야 합니다.

---

### Q2. ArrayBuffer의 특징으로 옳은 것은?

1. 직접 접근하여 읽고 쓸 수 있다
2. TypedArray를 통해 접근해야 한다
3. 문자열로 변환할 수 없다
4. 크기를 변경할 수 있다

**정답**: 2

**해설**: ArrayBuffer는 직접 접근할 수 없으며, TypedArray(Uint8Array, Int16Array 등)를 통해 접근해야 합니다.

---

### Q3. 다음 중 Blob을 ArrayBuffer로 변환하는 올바른 방법은?

1. `blob.toArrayBuffer()`
2. `await blob.arrayBuffer()`
3. `blob.convertToArrayBuffer()`
4. `new ArrayBuffer(blob)`

**정답**: 2

**해설**: Blob의 arrayBuffer() 메서드는 비동기 메서드이므로 await를 사용해야 합니다.

---

### Q4. 다음 TypedArray 중 8비트 부호 없는 정수 배열은?

1. Int8Array
2. Uint8Array
3. Int16Array
4. Float32Array

**정답**: 2

**해설**: Uint8Array는 8비트 부호 없는 정수 배열로, 0~255 범위의 값을 가집니다.

---

### Q5. BlobEvent의 event.data가 반환하는 타입은?

1. ArrayBuffer
2. Blob
3. string
4. Uint8Array

**정답**: 2

**해설**: BlobEvent의 data 속성은 Blob 타입을 반환합니다. ArrayBuffer로 변환하려면 arrayBuffer() 메서드를 사용해야 합니다.

---

### Q6. 메모리 풀링의 목적은?

1. 메모리 사용량을 증가시킨다
2. 빈번한 메모리 할당/해제를 줄여 성능을 향상시킨다
3. 가비지 컬렉터를 비활성화한다
4. 메모리 누수를 방지한다

**정답**: 2

**해설**: 메모리 풀링은 미리 할당된 메모리 버퍼를 재사용하여 빈번한 할당/해제로 인한 성능 저하를 방지합니다.

---

## 주관식 문제 (3문제)

### Q7. Blob 생성 시 전달할 수 있는 데이터 타입들을 통칭하는 용어는?

**정답**: BlobPart

**해설**: BlobPart는 문자열, ArrayBuffer, TypedArray, 다른 Blob 등을 포함할 수 있는 유니온 타입입니다.

---

### Q8. ArrayBuffer를 특정 타입으로 해석하는 뷰를 무엇이라고 하는가?

**정답**: TypedArray

**해설**: TypedArray는 ArrayBuffer를 특정 타입(예: Uint8Array, Int16Array, Float32Array)으로 해석하는 뷰입니다.

---

### Q9. Blob 생성 시 옵션을 지정하는 객체의 타입 이름은?

**정답**: BlobPropertyBag

**해설**: BlobPropertyBag은 type(MIME 타입)과 endings 속성을 포함하는 옵션 객체입니다.

---

## 코드 작성 문제 (4문제)

### Q10. 다음 코드의 빈칸을 채우세요.

```typescript
const blob = new Blob(["Hello", "World"], { type: "text/plain" });
const arrayBuffer = await blob.______();
console.log(arrayBuffer.byteLength);
```

**정답**: arrayBuffer

**해설**: Blob의 arrayBuffer() 메서드는 비동기 메서드이므로 await를 사용합니다.

---

### Q11. 다음 코드의 빈칸을 채우세요.

```typescript
const buffer = new ArrayBuffer(10);
const view = new ______(buffer); // 8비트 부호 없는 정수 배열
view[0] = 255;
```

**정답**: Uint8Array

**해설**: Uint8Array는 ArrayBuffer를 8비트 부호 없는 정수 배열로 해석하는 TypedArray입니다.

---

### Q12. 다음 요구사항을 만족하는 함수를 작성하세요.

- 함수명: `blobToArrayBuffer`
- 매개변수: `blob: Blob`
- 반환값: `Promise<ArrayBuffer>`
- 기능: Blob을 ArrayBuffer로 변환

**정답**:

```typescript
async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return await blob.arrayBuffer();
}
```

또는

```typescript
function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return blob.arrayBuffer();
}
```

**해설**: Blob의 arrayBuffer() 메서드를 사용하여 비동기적으로 변환합니다.

---

### Q13. 다음 요구사항을 만족하는 함수를 작성하세요.

- 함수명: `arrayBufferToBlob`
- 매개변수: `buffer: ArrayBuffer, mimeType: string`
- 반환값: `Blob`
- 기능: ArrayBuffer를 Blob으로 변환

**정답**:

```typescript
function arrayBufferToBlob(buffer: ArrayBuffer, mimeType: string): Blob {
  return new Blob([buffer], { type: mimeType });
}
```

**해설**: Blob 생성자의 첫 번째 인자로 ArrayBuffer를 배열에 담아 전달하고, 두 번째 인자로 MIME 타입을 지정합니다.

---

## 개념 설명 문제 (2문제)

### Q14. Blob과 ArrayBuffer의 차이점을 설명하고, 각각의 사용 사례를 제시하세요.

**정답**:

**Blob**:
- 파일과 유사한 불변 바이너리 데이터 객체
- MIME 타입 정보 포함
- 파일 다루기, URL 생성, 다운로드에 적합
- 사용 사례: 파일 다운로드, 이미지 표시, MediaRecorder 데이터 수집

**ArrayBuffer**:
- 고정 길이의 원시 바이너리 데이터 버퍼
- 직접 접근 불가, TypedArray로 접근
- 메모리 직접 조작, 네트워크 전송에 적합
- 사용 사례: WebSocket 이진 데이터 전송, 오디오 처리, 암호화

**변환 관계**:
- Blob → ArrayBuffer: `await blob.arrayBuffer()`
- ArrayBuffer → Blob: `new Blob([buffer], { type: mimeType })`

**해설**: Blob은 파일 추상화, ArrayBuffer는 메모리 추상화로 이해하면 됩니다.

---

### Q15. TypedArray의 종류와 각각의 특징을 설명하세요.

**정답**:

**Uint8Array**: 8비트 부호 없는 정수 (0~255)
- 바이너리 데이터 처리에 가장 많이 사용
- 예: 이미지 픽셀 데이터, 네트워크 패킷

**Int16Array**: 16비트 부호 있는 정수 (-32768~32767)
- 오디오 샘플 데이터 처리에 사용
- 예: 16비트 PCM 오디오

**Float32Array**: 32비트 부동소수점
- 고품질 오디오 데이터 처리에 사용
- 예: Web Audio API의 오디오 버퍼

**공통 특징**:
- 모두 ArrayBuffer를 특정 타입으로 해석하는 뷰
- 같은 ArrayBuffer에 여러 TypedArray를 생성할 수 있음 (다중 뷰)
- byteLength 속성으로 크기 확인 가능

**해설**: TypedArray는 ArrayBuffer를 다양한 숫자 타입으로 해석할 수 있게 해주는 뷰입니다.

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

