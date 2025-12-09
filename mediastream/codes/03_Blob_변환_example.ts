/**
 * Chapter 3 예제: Blob과 ArrayBuffer 변환
 * 
 * 이 파일은 실행 가능한 완전한 예제입니다.
 * HTML 파일과 함께 사용하세요.
 */

// ============================================
// 1. 기본 변환 함수
// ============================================

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
 * FileReader를 사용한 변환 (구식 방법, 호환성용)
 */
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

// ============================================
// 2. 유틸리티 함수
// ============================================

/**
 * 바이트 크기를 사람이 읽기 쉬운 형식으로 변환
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 두 ArrayBuffer가 같은지 비교
 */
function compareArrayBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): boolean {
  if (buffer1.byteLength !== buffer2.byteLength) {
    return false;
  }
  
  const view1 = new Uint8Array(buffer1);
  const view2 = new Uint8Array(buffer2);
  
  for (let i = 0; i < view1.length; i++) {
    if (view1[i] !== view2[i]) {
      return false;
    }
  }
  
  return true;
}

// ============================================
// 3. AudioChunkConverter 클래스
// ============================================

class AudioChunkConverter {
  /**
   * Blob을 ArrayBuffer로 변환
   */
  async toArrayBuffer(chunk: Blob): Promise<ArrayBuffer> {
    return await chunk.arrayBuffer();
  }

  /**
   * Blob을 Uint8Array로 변환
   */
  async toUint8Array(chunk: Blob): Promise<Uint8Array> {
    const buffer = await chunk.arrayBuffer();
    return new Uint8Array(buffer);
  }

  /**
   * Blob을 Base64 문자열로 변환
   */
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

  /**
   * Base64 문자열을 Blob으로 변환
   */
  base64ToBlob(base64: string, mimeType: string = 'application/octet-stream'): Blob {
    const binary = atob(base64);
    const uint8Array = new Uint8Array(binary.length);
    
    for (let i = 0; i < binary.length; i++) {
      uint8Array[i] = binary.charCodeAt(i);
    }
    
    return new Blob([uint8Array], { type: mimeType });
  }
}

// ============================================
// 4. MediaRecorder와 통합 예제
// ============================================

let converter: AudioChunkConverter;
let mediaRecorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;

/**
 * MediaRecorder 설정 및 변환 예제
 */
async function setupMediaRecorderWithConversion(): Promise<void> {
  try {
    // 1. 스트림 가져오기
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // 2. MediaRecorder 생성
    mediaRecorder = new MediaRecorder(stream);
    converter = new AudioChunkConverter();
    
    const chunks: Blob[] = [];
    
    // 3. 데이터 수집 및 변환
    mediaRecorder.ondataavailable = async (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
        
        // ArrayBuffer로 변환
        const arrayBuffer = await converter.toArrayBuffer(event.data);
        console.log('변환 완료:', {
          blobSize: formatBytes(event.data.size),
          bufferSize: formatBytes(arrayBuffer.byteLength),
          type: event.data.type,
        });
        
        // 여기서 WebSocket으로 전송할 수 있음 (Chapter 4)
        // websocket.send(arrayBuffer);
        
        // UI 업데이트
        updateConversionInfo(event.data, arrayBuffer);
      }
    };
    
    // 4. 녹화 완료 처리
    mediaRecorder.onstop = async () => {
      console.log('녹화 완료, 총 청크:', chunks.length);
      
      // 모든 청크를 하나로 합치기
      const finalBlob = new Blob(chunks, {
        type: mediaRecorder!.mimeType,
      });
      
      // 최종 Blob을 ArrayBuffer로 변환
      const finalBuffer = await converter.toArrayBuffer(finalBlob);
      console.log('최종 변환:', {
        blobSize: formatBytes(finalBlob.size),
        bufferSize: formatBytes(finalBuffer.byteLength),
      });
      
      // 재생 가능하도록 준비
      playBlob(finalBlob);
    };
    
    // 5. 녹화 시작 (100ms마다 청크 수집)
    mediaRecorder.start(100);
    console.log('녹화 시작 (100ms 간격)');
    
  } catch (error) {
    console.error('MediaRecorder 설정 실패:', error);
  }
}

/**
 * Blob 재생
 */
function playBlob(blob: Blob): void {
  const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = URL.createObjectURL(blob);
  
  const container = document.getElementById('playback');
  if (container) {
    container.innerHTML = '';
    container.appendChild(audio);
  }
  
  // 사용 후 URL 해제
  audio.onended = () => {
    URL.revokeObjectURL(audio.src);
  };
}

// ============================================
// 5. 테스트 함수
// ============================================

/**
 * Blob ↔ ArrayBuffer 변환 테스트
 */
async function testConversion(): Promise<void> {
  console.log('=== 변환 테스트 시작 ===');
  
  // 1. 원본 데이터 생성
  const originalText = 'Hello, World!';
  const originalBlob = new Blob([originalText], { type: 'text/plain' });
  console.log('원본 Blob:', {
    size: originalBlob.size,
    type: originalBlob.type,
  });
  
  // 2. Blob → ArrayBuffer
  const arrayBuffer = await blobToArrayBuffer(originalBlob);
  console.log('ArrayBuffer:', {
    byteLength: arrayBuffer.byteLength,
  });
  
  // 3. ArrayBuffer → Blob
  const convertedBlob = arrayBufferToBlob(arrayBuffer, 'text/plain');
  console.log('변환된 Blob:', {
    size: convertedBlob.size,
    type: convertedBlob.type,
  });
  
  // 4. 원본과 비교
  const originalText2 = await convertedBlob.text();
  console.log('원본 텍스트:', originalText);
  console.log('변환된 텍스트:', originalText2);
  console.log('일치 여부:', originalText === originalText2);
  
  console.log('=== 변환 테스트 완료 ===');
}

/**
 * 큰 Blob을 청크 단위로 처리
 */
async function processLargeBlob(
  blob: Blob,
  chunkSize: number = 1024 * 1024
): Promise<void> {
  console.log('=== 큰 Blob 처리 시작 ===');
  console.log('전체 크기:', formatBytes(blob.size));
  console.log('청크 크기:', formatBytes(chunkSize));
  
  let offset = 0;
  let chunkIndex = 0;
  
  while (offset < blob.size) {
    // Blob의 일부를 잘라내기
    const chunk = blob.slice(offset, offset + chunkSize);
    const arrayBuffer = await chunk.arrayBuffer();
    
    console.log(`청크 #${chunkIndex + 1}:`, {
      offset: formatBytes(offset),
      size: formatBytes(chunk.size),
      bufferSize: formatBytes(arrayBuffer.byteLength),
    });
    
    // 여기서 각 청크를 처리 (예: 전송)
    
    offset += chunkSize;
    chunkIndex++;
  }
  
  console.log('=== 큰 Blob 처리 완료 ===');
}

// ============================================
// 6. UI 업데이트 함수
// ============================================

function updateConversionInfo(blob: Blob, buffer: ArrayBuffer): void {
  const infoElement = document.getElementById('conversionInfo');
  if (infoElement) {
    infoElement.innerHTML = `
      <strong>Blob:</strong> ${formatBytes(blob.size)} (${blob.type})<br>
      <strong>ArrayBuffer:</strong> ${formatBytes(buffer.byteLength)} bytes<br>
      <strong>일치:</strong> ${blob.size === buffer.byteLength ? '✅' : '❌'}
    `;
  }
}

// ============================================
// 7. 메인 함수
// ============================================

async function startRecording(): Promise<void> {
  await setupMediaRecorderWithConversion();
  updateUI('recording');
}

function stopRecording(): void {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    
    // 스트림 정리
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    
    updateUI('stopped');
  }
}

function updateUI(state: 'stopped' | 'recording'): void {
  const statusElement = document.getElementById('status');
  const startButton = document.getElementById('startBtn') as HTMLButtonElement;
  const stopButton = document.getElementById('stopBtn') as HTMLButtonElement;

  if (!statusElement || !startButton || !stopButton) {
    return;
  }

  switch (state) {
    case 'stopped':
      statusElement.textContent = '정지됨';
      statusElement.style.color = '#666';
      startButton.disabled = false;
      stopButton.disabled = true;
      break;
    case 'recording':
      statusElement.textContent = '녹음 중... (변환 테스트)';
      statusElement.style.color = '#4CAF50';
      startButton.disabled = true;
      stopButton.disabled = false;
      break;
  }
}

// ============================================
// 8. 페이지 로드 시 초기화
// ============================================

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    console.log('Blob/ArrayBuffer 변환 예제 준비 완료');
    
    updateUI('stopped');

    // 버튼 이벤트 리스너
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const testBtn = document.getElementById('testBtn');

    startBtn?.addEventListener('click', startRecording);
    stopBtn?.addEventListener('click', stopRecording);
    testBtn?.addEventListener('click', testConversion);
    
    // 자동으로 테스트 실행
    testConversion();
  });
}

// ============================================
// 9. 내보내기 (모듈 시스템 사용 시)
// ============================================

export {
  blobToArrayBuffer,
  arrayBufferToBlob,
  blobToUint8Array,
  uint8ArrayToBlob,
  formatBytes,
  AudioChunkConverter,
  testConversion,
  processLargeBlob,
};

