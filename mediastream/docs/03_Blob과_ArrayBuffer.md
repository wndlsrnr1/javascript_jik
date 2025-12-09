# Chapter 3: Blob과 ArrayBuffer 이해하기

## 📖 학습 목표

이 챕터를 완료하면 다음을 이해할 수 있습니다:

- Blob과 ArrayBuffer의 차이와 각각의 용도
- Blob을 ArrayBuffer로 변환하는 방법
- ArrayBuffer를 WebSocket으로 전송하는 방법
- 메모리 관리와 성능 최적화

---

## 3.1 Blob이란 무엇인가?

### 개념 이해하기

**Blob** (Binary Large Object)은 파일과 유사한 불변(immutable) 데이터 객체입니다. 브라우저에서 파일을 다루는 기본 단위입니다.

일상 생활의 비유:
- **파일**: 컴퓨터의 파일처럼, Blob은 데이터를 담는 컨테이너입니다.
- **상자**: 물건을 담는 상자처럼, Blob은 바이너리 데이터를 담습니다.
- **USB 메모리**: 데이터를 저장하고 전송할 수 있는 저장소입니다.

### Blob의 특징

1. **불변성**: 한 번 생성된 Blob은 변경할 수 없습니다.
2. **타입 정보**: MIME 타입을 가질 수 있습니다 (예: "audio/webm").
3. **크기**: 데이터의 크기를 알 수 있습니다.
4. **슬라이싱**: 일부만 잘라낼 수 있습니다.

### Blob 생성하기

```typescript
// 1. 빈 Blob 생성
const emptyBlob = new Blob();
console.log(emptyBlob.size); // 0

// 2. 문자열로부터 Blob 생성
const textBlob = new Blob(['Hello, World!'], { type: 'text/plain' });
console.log(textBlob.size); // 13 bytes

// 3. 배열로부터 Blob 생성
const arrayBlob = new Blob([new Uint8Array([1, 2, 3, 4, 5])], {
  type: 'application/octet-stream',
});

// 4. 여러 데이터를 합쳐서 Blob 생성
const combinedBlob = new Blob(['Part 1', 'Part 2', 'Part 3'], {
  type: 'text/plain',
});
```

### Blob 속성

```typescript
const blob = new Blob(['데이터'], { type: 'audio/webm' });

console.log(blob.size);      // 크기 (bytes)
console.log(blob.type);      // MIME 타입
```

### Blob 메서드

```typescript
const blob = new Blob(['Hello, World!'], { type: 'text/plain' });

// 1. slice(): Blob의 일부를 잘라내기
const sliced = blob.slice(0, 5); // 처음 5바이트
console.log(sliced.size); // 5

// 2. arrayBuffer(): ArrayBuffer로 변환 (비동기)
blob.arrayBuffer().then((buffer) => {
  console.log('ArrayBuffer:', buffer);
});

// 3. text(): 텍스트로 변환 (비동기, 텍스트 Blob만)
blob.text().then((text) => {
  console.log('텍스트:', text);
});

// 4. stream(): ReadableStream으로 변환
const stream = blob.stream();
```

---

## 3.2 ArrayBuffer란 무엇인가?

### 개념 이해하기

**ArrayBuffer**는 고정 길이의 바이너리 데이터 버퍼입니다. 메모리에 직접 접근할 수 있는 원시(raw) 데이터입니다.

일상 생활의 비유:
- **메모리**: 컴퓨터의 RAM처럼, ArrayBuffer는 메모리 공간입니다.
- **원시 데이터**: 가공되지 않은 원시 데이터입니다.
- **바이트 배열**: 바이트 단위로 데이터를 저장합니다.

### ArrayBuffer의 특징

1. **고정 크기**: 생성 시 크기가 고정됩니다.
2. **타입 없음**: MIME 타입 정보가 없습니다.
3. **직접 접근 불가**: TypedArray나 DataView를 통해 접근해야 합니다.
4. **메모리 효율**: 메모리를 직접 다룹니다.

### ArrayBuffer 생성하기

```typescript
// 1. 지정된 크기의 ArrayBuffer 생성
const buffer = new ArrayBuffer(16); // 16 bytes
console.log(buffer.byteLength); // 16

// 2. MediaRecorder에서 받은 Blob을 ArrayBuffer로 변환
const blob = new Blob(['데이터']);
const buffer = await blob.arrayBuffer();
```

### TypedArray로 데이터 접근

ArrayBuffer는 직접 접근할 수 없으므로 TypedArray를 사용합니다:

```typescript
const buffer = new ArrayBuffer(16);

// Uint8Array: 8비트 부호 없는 정수 배열
const uint8Array = new Uint8Array(buffer);
uint8Array[0] = 255;
uint8Array[1] = 128;

// Int16Array: 16비트 부호 있는 정수 배열
const int16Array = new Int16Array(buffer);
int16Array[0] = 12345;

// Float32Array: 32비트 부동소수점 배열
const float32Array = new Float32Array(buffer);
float32Array[0] = 3.14;
```

### TypedArray 종류

| 타입 | 설명 | 바이트/요소 |
| ---- | ---- | ----------- |
| Int8Array | 8비트 부호 있는 정수 | 1 |
| Uint8Array | 8비트 부호 없는 정수 | 1 |
| Int16Array | 16비트 부호 있는 정수 | 2 |
| Uint16Array | 16비트 부호 없는 정수 | 2 |
| Int32Array | 32비트 부호 있는 정수 | 4 |
| Uint32Array | 32비트 부호 없는 정수 | 4 |
| Float32Array | 32비트 부동소수점 | 4 |
| Float64Array | 64비트 부동소수점 | 8 |

---

## 3.3 Blob과 ArrayBuffer의 차이

### 비교표

| 구분 | Blob | ArrayBuffer |
| ---- | ---- | ----------- |
| 용도 | 파일과 유사한 객체 | 원시 바이너리 데이터 |
| MIME 타입 | 있음 | 없음 |
| 크기 변경 | 불가능 (불변) | 불가능 (고정 크기) |
| 접근 방법 | 메서드 사용 | TypedArray/DataView 사용 |
| 사용 목적 | 파일 다루기, URL 생성 | 메모리 직접 조작, 네트워크 전송 |
| 메모리 효율 | 상대적으로 낮음 | 높음 |

### 언제 무엇을 사용할까?

**Blob을 사용하는 경우**:
- 파일 다운로드/업로드
- `<audio>`, `<video>` 태그의 src에 사용
- `URL.createObjectURL()`로 URL 생성
- 파일 API와 함께 사용

**ArrayBuffer를 사용하는 경우**:
- WebSocket으로 이진 데이터 전송
- 데이터를 직접 조작해야 할 때
- 메모리 효율이 중요할 때
- 암호화/복호화 등 바이트 단위 작업

---

## 3.4 Blob을 ArrayBuffer로 변환하기

### 방법 1: arrayBuffer() 메서드 (권장)

가장 간단하고 권장되는 방법입니다:

```typescript
async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return await blob.arrayBuffer();
}

// 사용 예제
const blob = new Blob(['Hello'], { type: 'text/plain' });
const buffer = await blobToArrayBuffer(blob);
console.log('ArrayBuffer 크기:', buffer.byteLength);
```

### 방법 2: FileReader API

FileReader를 사용하는 방법 (구식이지만 호환성이 좋음):

```typescript
function blobToArrayBufferWithFileReader(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('ArrayBuffer 변환 실패'));
      }
    };
    
    reader.onerror = () => {
      reject(reader.error);
    };
    
    reader.readAsArrayBuffer(blob);
  });
}

// 사용 예제
const blob = new Blob(['Hello'], { type: 'text/plain' });
const buffer = await blobToArrayBufferWithFileReader(blob);
```

### MediaRecorder에서 받은 Blob 변환

실제 사용 예제:

```typescript
const chunks: Blob[] = [];

mediaRecorder.ondataavailable = async (event: BlobEvent) => {
  if (event.data && event.data.size > 0) {
    // Blob을 ArrayBuffer로 변환
    const arrayBuffer = await event.data.arrayBuffer();
    
    console.log('변환 완료:', {
      blobSize: event.data.size,
      bufferSize: arrayBuffer.byteLength,
      type: event.data.type,
    });
    
    // WebSocket으로 전송 (Chapter 4)
    // websocket.send(arrayBuffer);
  }
};
```

---

## 3.5 ArrayBuffer를 Blob으로 변환하기

반대로 ArrayBuffer를 Blob으로 변환할 수도 있습니다:

```typescript
function arrayBufferToBlob(
  buffer: ArrayBuffer,
  mimeType: string = 'application/octet-stream'
): Blob {
  return new Blob([buffer], { type: mimeType });
}

// 사용 예제
const buffer = new ArrayBuffer(16);
const blob = arrayBufferToBlob(buffer, 'audio/webm');
console.log('Blob 크기:', blob.size);
console.log('Blob 타입:', blob.type);
```

---

## 3.6 WebSocket 전송을 위한 데이터 준비

### WebSocket이 받을 수 있는 데이터 형식

WebSocket의 `send()` 메서드는 다음 형식을 받을 수 있습니다:

1. **string**: 텍스트 메시지
2. **ArrayBuffer**: 이진 데이터
3. **Blob**: 파일과 유사한 객체
4. **TypedArray**: Uint8Array 등

### 실시간 오디오 전송 예제

```typescript
// MediaRecorder에서 받은 Blob을 ArrayBuffer로 변환하여 전송
mediaRecorder.ondataavailable = async (event: BlobEvent) => {
  if (event.data && event.data.size > 0 && websocket.readyState === WebSocket.OPEN) {
    try {
      // Blob을 ArrayBuffer로 변환
      const arrayBuffer = await event.data.arrayBuffer();
      
      // WebSocket으로 전송
      websocket.send(arrayBuffer);
      
      console.log('전송 완료:', arrayBuffer.byteLength, 'bytes');
    } catch (error) {
      console.error('전송 실패:', error);
    }
  }
};
```

### 메타데이터와 함께 전송

오디오 데이터와 함께 메타데이터를 전송하려면 JSON과 이진 데이터를 조합합니다:

```typescript
interface AudioChunkMetadata {
  timestamp: number;
  sequence: number;
  mimeType: string;
  size: number;
}

let sequenceNumber = 0;

mediaRecorder.ondataavailable = async (event: BlobEvent) => {
  if (event.data && event.data.size > 0 && websocket.readyState === WebSocket.OPEN) {
    try {
      // 메타데이터 생성
      const metadata: AudioChunkMetadata = {
        timestamp: Date.now(),
        sequence: sequenceNumber++,
        mimeType: event.data.type,
        size: event.data.size,
      };
      
      // 메타데이터를 JSON으로 전송
      websocket.send(JSON.stringify({
        type: 'metadata',
        data: metadata,
      }));
      
      // 오디오 데이터를 ArrayBuffer로 변환하여 전송
      const arrayBuffer = await event.data.arrayBuffer();
      websocket.send(JSON.stringify({
        type: 'audio',
        size: arrayBuffer.byteLength,
      }));
      websocket.send(arrayBuffer);
      
    } catch (error) {
      console.error('전송 실패:', error);
    }
  }
};
```

---

## 3.7 메모리 관리

### 메모리 누수 방지

Blob과 ArrayBuffer를 사용할 때 메모리 누수를 주의해야 합니다:

```typescript
// ❌ 나쁜 예: 청크를 계속 쌓아두기
const chunks: Blob[] = [];

mediaRecorder.ondataavailable = (event: BlobEvent) => {
  chunks.push(event.data); // 계속 쌓이면 메모리 부족!
};

// ✅ 좋은 예: 전송 후 즉시 정리
mediaRecorder.ondataavailable = async (event: BlobEvent) => {
  if (event.data && event.data.size > 0) {
    const arrayBuffer = await event.data.arrayBuffer();
    
    // 전송
    websocket.send(arrayBuffer);
    
    // 명시적으로 정리 (가비지 컬렉션 힌트)
    // JavaScript는 자동으로 정리하지만, 큰 데이터는 명시적으로 null 할당
  }
};
```

### URL.createObjectURL() 정리

Blob으로 생성한 URL은 반드시 해제해야 합니다:

```typescript
// URL 생성
const blob = new Blob(['데이터'], { type: 'audio/webm' });
const url = URL.createObjectURL(blob);

// 사용
audioElement.src = url;

// 사용 후 반드시 해제
URL.revokeObjectURL(url);
```

### 큰 데이터 처리

큰 파일을 처리할 때는 청크 단위로 나누어 처리합니다:

```typescript
async function processLargeBlob(blob: Blob, chunkSize: number = 1024 * 1024): Promise<void> {
  let offset = 0;
  
  while (offset < blob.size) {
    // Blob의 일부를 잘라내기
    const chunk = blob.slice(offset, offset + chunkSize);
    const arrayBuffer = await chunk.arrayBuffer();
    
    // 처리 (예: 전송)
    console.log(`청크 처리: ${offset} ~ ${offset + chunk.size} bytes`);
    
    offset += chunkSize;
  }
}

// 사용 예제
const largeBlob = new Blob([new ArrayBuffer(10 * 1024 * 1024)]); // 10MB
await processLargeBlob(largeBlob, 1024 * 1024); // 1MB씩 처리
```

---

## 3.8 성능 최적화

### 변환 최적화

Blob을 ArrayBuffer로 변환하는 것은 비동기 작업이므로, 여러 개를 동시에 변환하면 성능이 저하될 수 있습니다:

```typescript
// ❌ 나쁜 예: 동시에 여러 개 변환
const blobs: Blob[] = [/* ... */];
const buffers = await Promise.all(
  blobs.map((blob) => blob.arrayBuffer())
); // 메모리 부족 가능

// ✅ 좋은 예: 순차적으로 처리하거나 제한
async function processBlobsSequentially(blobs: Blob[]): Promise<ArrayBuffer[]> {
  const buffers: ArrayBuffer[] = [];
  
  for (const blob of blobs) {
    const buffer = await blob.arrayBuffer();
    buffers.push(buffer);
    // 전송 후 즉시 정리
  }
  
  return buffers;
}
```

### 버퍼 풀링

자주 사용하는 버퍼를 재사용하여 메모리 할당을 줄입니다:

```typescript
class BufferPool {
  private pool: ArrayBuffer[] = [];
  private poolSize: number;

  constructor(poolSize: number = 10) {
    this.poolSize = poolSize;
  }

  acquire(size: number): ArrayBuffer {
    // 풀에서 재사용 가능한 버퍼 찾기
    const index = this.pool.findIndex(
      (buf) => buf.byteLength >= size
    );
    
    if (index !== -1) {
      return this.pool.splice(index, 1)[0];
    }
    
    // 없으면 새로 생성
    return new ArrayBuffer(size);
  }

  release(buffer: ArrayBuffer): void {
    if (this.pool.length < this.poolSize) {
      this.pool.push(buffer);
    }
    // 풀이 가득 차면 가비지 컬렉션에 맡김
  }
}
```

---

## 3.9 실전 예제: Blob → ArrayBuffer 변환 유틸리티

완전한 유틸리티 함수 모음:

```typescript
/**
 * Blob을 ArrayBuffer로 변환
 */
async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return await blob.arrayBuffer();
}

/**
 * ArrayBuffer를 Blob으로 변환
 */
function arrayBufferToBlob(
  buffer: ArrayBuffer,
  mimeType: string = 'application/octet-stream'
): Blob {
  return new Blob([buffer], { type: mimeType });
}

/**
 * Blob을 Uint8Array로 변환
 */
async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Uint8Array를 Blob으로 변환
 */
function uint8ArrayToBlob(
  array: Uint8Array,
  mimeType: string = 'application/octet-stream'
): Blob {
  return new Blob([array], { type: mimeType });
}

/**
 * Blob의 크기를 사람이 읽기 쉬운 형식으로 변환
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * MediaRecorder 청크를 ArrayBuffer로 변환하는 헬퍼
 */
class AudioChunkConverter {
  async toArrayBuffer(chunk: Blob): Promise<ArrayBuffer> {
    return await chunk.arrayBuffer();
  }

  async toUint8Array(chunk: Blob): Promise<Uint8Array> {
    const buffer = await chunk.arrayBuffer();
    return new Uint8Array(buffer);
  }

  async toBase64(chunk: Blob): Promise<string> {
    const buffer = await chunk.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Base64 인코딩
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    
    return btoa(binary);
  }
}

// 사용 예제
const converter = new AudioChunkConverter();

mediaRecorder.ondataavailable = async (event: BlobEvent) => {
  if (event.data && event.data.size > 0) {
    // ArrayBuffer로 변환
    const arrayBuffer = await converter.toArrayBuffer(event.data);
    console.log('ArrayBuffer:', formatBytes(arrayBuffer.byteLength));
    
    // 또는 Uint8Array로 변환
    const uint8Array = await converter.toUint8Array(event.data);
    console.log('Uint8Array:', formatBytes(uint8Array.length));
  }
};
```

---

## 3.10 요약

이 챕터에서 배운 내용:

1. **Blob**: 파일과 유사한 불변 데이터 객체, MIME 타입 정보 포함
2. **ArrayBuffer**: 원시 바이너리 데이터 버퍼, 메모리 직접 접근
3. **변환**: Blob ↔ ArrayBuffer 상호 변환 가능
4. **WebSocket 전송**: ArrayBuffer나 Blob을 직접 전송 가능
5. **메모리 관리**: 사용 후 정리, 큰 데이터는 청크 단위 처리
6. **성능 최적화**: 순차 처리, 버퍼 풀링 등

---

## 3.11 다음 단계

다음 챕터에서는 WebSocket을 사용하여 변환한 ArrayBuffer를 Django 서버로 실시간 전송하는 방법을 배웁니다.

---

## 연습 문제

1. Blob을 ArrayBuffer로 변환하는 함수를 작성하세요.
2. ArrayBuffer를 Blob으로 변환하는 함수를 작성하세요.
3. MediaRecorder에서 받은 Blob을 ArrayBuffer로 변환하여 콘솔에 출력하는 코드를 작성하세요.

답안은 `codes/03_Blob_변환_example.ts` 파일을 참고하세요.

