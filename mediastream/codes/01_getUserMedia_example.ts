/**
 * Chapter 1 예제: getUserMedia를 사용한 마이크 접근
 * 
 * 이 파일은 실행 가능한 완전한 예제입니다.
 * HTML 파일과 함께 사용하세요.
 */

// ============================================
// 1. 기본 타입 정의
// ============================================

interface MicrophoneAccessOptions {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

// ============================================
// 2. 에러 처리 함수
// ============================================

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
      alert(`오류가 발생했습니다: ${error.message}`);
  }
}

// ============================================
// 3. 마이크 접근 함수
// ============================================

async function requestMicrophoneAccess(
  options: MicrophoneAccessOptions = {}
): Promise<MediaStream | null> {
  // 1. getUserMedia 지원 확인
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('이 브라우저는 getUserMedia를 지원하지 않습니다.');
    alert('이 브라우저는 마이크 접근을 지원하지 않습니다.');
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
    logStreamInfo(stream);

    return stream;
  } catch (error) {
    handleGetUserMediaError(error);
    return null;
  }
}

// ============================================
// 4. 스트림 정보 출력 함수
// ============================================

function logStreamInfo(stream: MediaStream): void {
  console.log('=== 스트림 정보 ===');
  console.log('스트림 ID:', stream.id);
  console.log('활성 상태:', stream.active);
  console.log('트랙 개수:', stream.getTracks().length);

  const audioTracks = stream.getAudioTracks();
  audioTracks.forEach((track, index) => {
    console.log(`\n오디오 트랙 #${index + 1}:`, {
      id: track.id,
      label: track.label,
      kind: track.kind,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState,
      settings: track.getSettings(),
    });
  });
}

// ============================================
// 5. 스트림 정리 함수
// ============================================

function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    track.stop();
    console.log('트랙 정지:', track.kind, track.id);
  });
}

function muteMicrophone(stream: MediaStream): void {
  stream.getAudioTracks().forEach((track) => {
    track.enabled = false;
    console.log('마이크 음소거:', track.id);
  });
}

function unmuteMicrophone(stream: MediaStream): void {
  stream.getAudioTracks().forEach((track) => {
    track.enabled = true;
    console.log('마이크 음소거 해제:', track.id);
  });
}

// ============================================
// 6. 권한 확인 함수
// ============================================

async function checkMicrophonePermission(): Promise<PermissionState | null> {
  if (!navigator.permissions) {
    console.warn('이 브라우저는 Permissions API를 지원하지 않습니다.');
    return null;
  }

  try {
    const result = await navigator.permissions.query({ 
      name: 'microphone' as PermissionName 
    });
    return result.state;
  } catch (error) {
    console.error('권한 확인 실패:', error);
    return null;
  }
}

// ============================================
// 7. 메인 실행 함수 (HTML에서 호출)
// ============================================

let currentStream: MediaStream | null = null;

async function startMicrophone(): Promise<void> {
  // 기존 스트림이 있으면 정리
  if (currentStream) {
    stopStream(currentStream);
    currentStream = null;
  }

  // 권한 확인
  const permission = await checkMicrophonePermission();
  console.log('현재 마이크 권한:', permission);

  // 마이크 접근
  const stream = await requestMicrophoneAccess({
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  });

  if (stream) {
    currentStream = stream;
    console.log('마이크 준비 완료!');
    updateUI('recording');
  }
}

function stopMicrophone(): void {
  if (currentStream) {
    stopStream(currentStream);
    currentStream = null;
    console.log('마이크 정지');
    updateUI('stopped');
  }
}

function toggleMute(): void {
  if (!currentStream) {
    console.warn('활성화된 스트림이 없습니다.');
    return;
  }

  const audioTracks = currentStream.getAudioTracks();
  const isMuted = audioTracks.some((track) => !track.enabled);

  if (isMuted) {
    unmuteMicrophone(currentStream);
    updateUI('recording');
  } else {
    muteMicrophone(currentStream);
    updateUI('muted');
  }
}

// ============================================
// 8. UI 업데이트 함수 (HTML과 연동)
// ============================================

function updateUI(state: 'stopped' | 'recording' | 'muted'): void {
  const statusElement = document.getElementById('status');
  const startButton = document.getElementById('startBtn') as HTMLButtonElement;
  const stopButton = document.getElementById('stopBtn') as HTMLButtonElement;
  const muteButton = document.getElementById('muteBtn') as HTMLButtonElement;

  if (!statusElement || !startButton || !stopButton || !muteButton) {
    return;
  }

  switch (state) {
    case 'stopped':
      statusElement.textContent = '정지됨';
      statusElement.style.color = '#666';
      startButton.disabled = false;
      stopButton.disabled = true;
      muteButton.disabled = true;
      break;
    case 'recording':
      statusElement.textContent = '녹음 중...';
      statusElement.style.color = '#4CAF50';
      startButton.disabled = true;
      stopButton.disabled = false;
      muteButton.disabled = false;
      muteButton.textContent = '음소거';
      break;
    case 'muted':
      statusElement.textContent = '음소거됨';
      statusElement.style.color = '#FF9800';
      startButton.disabled = true;
      stopButton.disabled = false;
      muteButton.disabled = false;
      muteButton.textContent = '음소거 해제';
      break;
  }
}

// ============================================
// 9. 페이지 로드 시 초기화
// ============================================

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    console.log('getUserMedia 예제 준비 완료');
    updateUI('stopped');

    // 버튼 이벤트 리스너 (HTML에서 직접 연결할 수도 있음)
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const muteBtn = document.getElementById('muteBtn');

    startBtn?.addEventListener('click', startMicrophone);
    stopBtn?.addEventListener('click', stopMicrophone);
    muteBtn?.addEventListener('click', toggleMute);
  });
}

// ============================================
// 10. 내보내기 (모듈 시스템 사용 시)
// ============================================

export {
  requestMicrophoneAccess,
  stopStream,
  muteMicrophone,
  unmuteMicrophone,
  checkMicrophonePermission,
  handleGetUserMediaError,
  startMicrophone,
  stopMicrophone,
  toggleMute,
};

