/**
 * MediaRecorder로 오디오 캡처하기
 *
 * 학습 목표
 *
 * 이 챕터를 완료하면 다음을 이해할 수 있습니다.
 *
 * MediaRecorder가 무엇인지, 왜 필요한지
 * MediaRecorder를 생성하고 사용하는 방법
 * 실시간으로 오디오 데잍러르 청크 단위로 수입하는 방법
 * MIME 타입과 코덱 선택 방법
 * MediaRecorder의 생명주기와 상태 관리
 *
 * MediaRecorder란 무엇인가?
 *
 * 개념 이해하기
 *
 * MediaRecorder는 MediaStream에서 흐르는 오디오/비디오 데이터를 실제로 수집하고 저장하는 도구입니다.
 *
 * 일상 생활의 비유:
 *
 * 녹음기: 실제 녹음기처럼 MediaStream의 데이터를 기록합니다.
 *
 * 비디오 카메라: 영상을 촬영하듯이 스트림을 녹화합ㄴ비다.
 *
 * 수집함: 데이터를 모아서 나중에 사용할 수 있게 합니다.
 *
 * MediaRecorder의 역할
 *
 * MediaRecorder는 다음과 같은 일을 합니다.
 *
 * 데이터 수집: MediaStream에서 오디오/비디오 데이터를 받아옵니다.
 * 인코딩: 받은 데이털를 특정 형식 (WebM, MP4) 으로 변환합니다.
 * 청크 생성: 데이터를 작은 단위(Blob)으로 나누어 제공합니다.
 * 상태 관리: 녹화 시작, 일시 정지, 재개, 정지 등을 관리합니다.
 *
 * MediaStream 데이터를 실시간으로 전ㄷ라함. 실시간 스트림임, 저장하지 않음, 실시간 재생, 전송임
 * MediaRecorder 데이터를 수집하고 저장함, Blob 청크단위 수집하여 저장 가능, 녹화, 저장 분석
 *
 *  MediaRecorder 생성하기
 *
 * 기본 생성
 *
 * 가장 간단한 형태로 MediaRecorder를 생성하는 방법입니다.
 *
 */

// 1. MediaStream 가져오기 (Chapter 1에서 배운 내용)

const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
  audio: true,
});

const mediaRecorder: MediaRecorder = new MediaRecorder(stream);

//  생성자 옵션

// MediaRecorder를 생성할 때 옵션을 지정할 수 있습니다.
interface MediaRecorderOptions {
  mimeType?: string; //MIME 타입 (예: audio/webm)
  audioBitsPerSecond?: number; // 오디오 비트레이트
  videoBitsPerSecond?: number; // 비디오 비트레이트
  bitsPerSecond?: number; // 전체 비트레이트
}

const options: MediaRecorderOptions = {
  mimeType: "audio/webm;codecs=opus",
  audioBitsPerSecond: 128000, // 128 kbps
};

const mediaRecorder = new MediaRecorder(stream, options);

// 2.2 MediaRecorder 생성하기

// 기본 생성

// 가장 간단한 형태로 MediaRecorder를 생성하는 방법입니다.

// 1. MediaStream 가져오기 (Chapter 1에서 배운 내용)

interface MediaRecorderOptions {
  mimType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
  bitsPerSecond?: number;
}

const options: MediaRecorderOptions = {
  mimeType: "audio/webm;codecs=opus",
  audioBitsPerSecond: 128000, // 128 kbps
};

const mediaRecorder = new MediaRecorder(stream, options);

// MIME 타입 확인

//  브라우저가 특정 MIME 타입을 지원하는지 확인할 수 있습니다.
// 특정 MIME 타입 지원 여부 확인

/**
 * 개념 이해하기
 * MediaRecorder는 MediaStream에서 흐르는 오디오/비디오 데이터를 실제로 수집하고 저장한느 도구입니다.
 * 일상 생활의 비유:
 * 녹음기: 실제 녹음기처럼 MediaStream의 데잍러ㅡㄹ 기록합니다.
 * 비디오 카메라: 영상을 촬영하듯이 스트림을 녹화합니다.
 * 수집함: 데이터를 모아서 나중에 사용할 수 잇게합니다.
 *
 * MediaRecorder MediaStream
 *
 * MediaStream,
 * MediaRecorder
 *
 *
 */
// MediaRecorder 생성하기

// 기본 생성

// 가장 간단한 형태로 MediaRecorder를 생성하는 방법
/**
 * 생성자 옵션
 *
 * MediaRoecorder를 생성할때 옵션을 지정할 수 있습니다.
 *
 */

interface MediaRecorderOptions {
  mimType?: string; // MIME 타입 (audio/webm)
  audioBitsPerSecond?: number; // 오디오 비트레이트
  videoBitsPerSecond?: number; // 비디오 비트레이트
  bitPerSecond?: number; // 전체 비트레이트
}

const options: MediaRecorderOptions = {
  mimeType: "audio/webm;codecs=opus",
  audioBitsPerSecond: 128000,
};

const mediaRecorder = new MediaRecorder(stream, options);

// MIME 타입 확인

// 브라우저가 특정 MIME 타입을 지원하는지 확인할 수 있습니다.
//
//
// coinst 특정 MIME 타입 지원 여부 확인

/**
 * 지원 하는 MIME 타입 확인 함수
 */

function getSupportedMimeTypes(): string[] {
  const types = [
    "audio/webm",
    "audio/webm;codecs=opus",
    "audio/ogg;codecs=opus",
    "audio/mp4",
    "audio/mpeg",
  ];
  return types.filter((type: string) => {
    MediaRecorder.isTypeSupported(type);
  });
}

const supportedTypes = getSupportedMimeTypes();
console.log("지원하는 형식: ", supportedTypes);

/**
 * 상태 (State)
 *
 * MediaRecorder는 세 가지 상태를 가집니다.
 *
 * inactive:
 * recording:
 * paused:
 *
 * start(timeslice?)
 * stop()
 * pause()
 * resume()
 * requestData()
 *
 *
 */

/**
 * 녹화 시작 하기
 *
 * 기본 시작
 *
 * 가장 간단한 방법으로 녹화를 시작합니다.
 *
 *
 */

const mr = new MediaRecorder(stream);
mediaRecorder.start();
console.log("녹화 시작", mediaRecorder.state);

/**
 * Timeslice를 사용한 청크 단위 녹화
 *
 * Timeslice는 데이터를 주기적으로 나누어 받는 간격(밀리초)입니다.
 * 실시간 전송에 유용합니다.
 *
 * mediaRecorder.start(1000);
 *
 * mediaRecorder.start(100);
 *
 * Timeslice를 사용하는 이유:
 * 실시간 전송: 작은 청크로 나누어 WebSocket 등으로 전송 가능
 * 메모리 관리: 큰 데이터를 한 번에 받지 않고 나누어 받음.
 * 진행 상황 추적: 주기적으로 데이터를 받아 진행 상황 확인 가능
 *
 * 작은 청크로 나누어 Websocket 등으로 전송 가능
 *
 * 메모리 관리: 큰 데이터를 한 번에 받지 않고 나누어 받음
 *
 * 진행 상황 추적: 주기적으로 데이터를 받아 진행상황 확인 가능
 *
 * Timeslice 없이 녹화
 *
 * Timeslice를 지정하지 않으면 녹화가 끝날 때까지 데이터를 받지 않습니다.
 *
 * stop을 호출할 때가지 dataavailable 이벤트가 발생하지 않음
 *
 * stop() 호출 시 마지막 dataavailable 이벤트 발생
 *
 *
 */
