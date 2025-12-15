# MediaStream 키워드 참조 가이드

words.md에 나열된 키워드들을 순서대로 정리한 참조 문서입니다. 각 키워드에 대한 간략한 설명을 제공합니다.

---

## MediaStream 기본

### MediaStream
실시간으로 오디오/비디오 데이터를 전달하는 스트림 객체. `navigator.mediaDevices.getUserMedia()`로 생성되며, 하나 이상의 MediaStreamTrack을 포함합니다.

### getUserMedia
브라우저 API로 마이크/카메라 접근을 요청하는 함수. Promise를 반환하며, Secure Context(HTTPS 또는 localhost)에서만 사용 가능합니다.

### navigator
브라우저의 네비게이터 객체로, 브라우저와 시스템 정보에 접근할 수 있는 전역 객체입니다.

### navigator.mediaDevices
미디어 장치에 접근하기 위한 API를 제공하는 객체. `getUserMedia()`, `enumerateDevices()` 등의 메서드를 포함합니다.

### MediaStreamTrack
MediaStream을 구성하는 개별 트랙(오디오 또는 비디오). 각 트랙은 `enabled`, `stop()` 등의 메서드와 속성을 가집니다.

### MediaStreamConstraints
`getUserMedia()` 호출 시 원하는 미디어 조건을 지정하는 객체. 예: `{ audio: true, video: { width: 1280 } }`

### MediaTrackConstraints
개별 트랙에 대한 제약 조건을 지정하는 객체. `ideal`, `min`, `max`, `exact` 등의 키워드를 사용합니다.

---

## 에러 및 권한

### NotAllowedError
사용자가 마이크/카메라 권한을 거부했을 때 발생하는 DOMException. 브라우저 설정에서 권한을 허용해야 합니다.

### PermissionState
권한 상태를 나타내는 열거형. `granted`, `denied`, `prompt` 값을 가질 수 있습니다.

### PermissionStatus
권한 상태를 확인하는 API의 반환 객체. `state` 속성으로 현재 권한 상태를 확인할 수 있습니다.

### PermissionName
권한의 이름을 나타내는 문자열. 예: `"microphone"`, `"camera"`

### DOMException
DOM 작업 중 발생하는 예외를 나타내는 객체. 다양한 에러 타입(NotAllowedError, NotFoundError 등)의 기본 클래스입니다.

### NotFoundError
요청한 미디어 장치가 없을 때 발생하는 에러. 장치가 연결되어 있는지 확인해야 합니다.

### NotReadableError
다른 프로그램이 장치를 사용 중이거나 장치에 접근할 수 없을 때 발생하는 에러.

### OverConstrainedError
요청한 Constraints를 만족하는 장치가 없을 때 발생하는 에러. Constraints를 완화해야 합니다.

---

## MediaStreamTrack 제어

### enabled
MediaStreamTrack의 활성화 상태를 제어하는 boolean 속성. `false`로 설정하면 트랙이 음소거됩니다.

### stop
MediaStreamTrack을 중지하는 메서드. 호출 후 트랙은 더 이상 데이터를 생성하지 않습니다.

### getTracks()
MediaStream에 포함된 모든 트랙을 반환하는 메서드. `stream.getTracks()`로 호출합니다.

---

## MediaRecorder

### isTypeSupported
지정된 MIME 타입이 MediaRecorder에서 지원되는지 확인하는 정적 메서드. `MediaRecorder.isTypeSupported('audio/webm')` 형태로 사용합니다.

### ondataavailable
MediaRecorder가 데이터 청크를 생성할 때 발생하는 이벤트. `event.data`로 Blob 데이터에 접근할 수 있습니다.

### MediaRecorderOptions
MediaRecorder 생성 시 전달하는 옵션 객체. `mimeType`, `audioBitsPerSecond`, `videoBitsPerSecond` 등을 지정할 수 있습니다.

### inactive
MediaRecorder의 초기 상태. 아직 녹화가 시작되지 않은 상태입니다.

### recording
MediaRecorder가 현재 녹화 중인 상태. `state` 속성으로 확인할 수 있습니다.

### paused
MediaRecorder가 일시 정지된 상태. `pause()` 메서드로 전환되며, `resume()`으로 재개할 수 있습니다.

### pause()
MediaRecorder를 일시 정지하는 메서드. 녹화는 중단되지만 MediaRecorder 객체는 유지됩니다.

### resume()
일시 정지된 MediaRecorder를 재개하는 메서드. `paused` 상태에서만 호출 가능합니다.

### .onpause()
MediaRecorder가 일시 정지될 때 발생하는 이벤트 핸들러. `mediaRecorder.onpause = () => {}` 형태로 설정합니다.

### .onresume()
MediaRecorder가 재개될 때 발생하는 이벤트 핸들러. `mediaRecorder.onresume = () => {}` 형태로 설정합니다.

**참고**: MediaRecorder는 MediaStream에 대한 제어권을 가지는 것처럼 보이지만 실제로는 가지지 않습니다. MediaRecorder는 단지 스트림의 데이터를 수집하고 인코딩할 뿐입니다.

---

## 데이터 형식

### Blob
파일과 유사한 불변(immutable) 바이너리 데이터 객체. MIME 타입과 크기 정보를 포함하며, `arrayBuffer()`, `text()` 등의 메서드로 데이터에 접근할 수 있습니다.

### BlobEvent
MediaRecorder가 데이터 청크를 생성할 때 발생하는 이벤트. `event.data` 속성으로 Blob 데이터에 접근합니다.

### Event.data
이벤트 객체의 데이터 속성. BlobEvent의 경우 Blob 객체를, MessageEvent의 경우 메시지 데이터를 포함합니다.

### immutable data object
생성 후 변경할 수 없는 데이터 객체. Blob, ArrayBuffer 등이 이에 해당하며, 수정이 필요하면 새로운 객체를 생성해야 합니다.

### BlobPart
Blob 생성 시 전달할 수 있는 데이터 타입. 문자열, ArrayBuffer, TypedArray, 다른 Blob 등을 포함할 수 있습니다.

### BlobPropertyBag
Blob 생성 시 옵션을 지정하는 객체. `type`(MIME 타입)과 `endings` 속성을 포함합니다.

### Size
Blob의 크기를 나타내는 속성. 바이트 단위로 표현됩니다.

### type
Blob의 MIME 타입을 나타내는 속성. 예: `"audio/webm"`, `"application/octet-stream"`

---

## 메모리 및 데이터 접근

### 메모리에 직접 접근
ArrayBuffer와 TypedArray를 통해 메모리의 바이너리 데이터에 직접 접근할 수 있습니다. JavaScript의 일반적인 메모리 관리와 달리 더 세밀한 제어가 가능합니다.

### .arrayBuffer()
Blob을 ArrayBuffer로 변환하는 비동기 메서드. `await blob.arrayBuffer()` 형태로 사용하며, WebSocket으로 이진 데이터를 전송할 때 유용합니다.

### .byteLength
ArrayBuffer나 TypedArray의 바이트 길이를 나타내는 속성. 데이터 크기를 확인할 때 사용합니다.

### Uint8Array
8비트 부호 없는 정수 배열. ArrayBuffer를 0~255 범위의 정수 배열로 해석하는 TypedArray입니다.

### Int16Array
16비트 부호 있는 정수 배열. 오디오 샘플 데이터를 다룰 때 자주 사용됩니다.

### Float32Array
32비트 부동소수점 배열. 고품질 오디오 데이터 처리에 사용됩니다.

### new Blob의 인자 arrayBuffer
Blob 생성 시 ArrayBuffer를 BlobPart로 전달할 수 있습니다. `new Blob([arrayBuffer], { type: 'audio/webm' })` 형태로 사용합니다.

---

## 메모리 관리

### 풀링
메모리 풀링은 미리 할당된 메모리 버퍼를 재사용하는 기법입니다. 빈번한 메모리 할당/해제를 줄여 성능을 향상시킬 수 있습니다.

### acquire
메모리 풀에서 버퍼를 획득하는 과정. 사용할 메모리 버퍼를 요청하는 동작입니다.

### release
사용이 끝난 메모리 버퍼를 풀로 반환하는 과정. 가비지 컬렉터가 자동으로 처리하기 전에 명시적으로 반환할 수 있습니다.

### 가비지 컬렉터
사용하지 않는 메모리를 자동으로 해제하는 JavaScript 엔진의 메커니즘. 개발자가 명시적으로 메모리를 관리하지 않아도 됩니다.

---

## 오디오 포맷

### MIMETYPE
데이터의 미디어 타입을 나타내는 문자열. `audio/webm`, `audio/webm;codecs=opus` 등의 형식으로 표현됩니다.

### codec
데이터를 압축/압축 해제하는 알고리즘. 오디오의 경우 Opus, PCM, AAC 등이 있으며, 파일 크기와 품질의 균형을 결정합니다.

### bitrate
초당 전송되는 비트 수. 오디오 품질과 파일 크기에 직접적인 영향을 미치며, `audioBitsPerSecond` 옵션으로 설정할 수 있습니다.

### opus
고품질 오디오 코덱. WebM 컨테이너와 함께 사용되며, 낮은 지연시간과 우수한 압축률을 제공합니다.

### PCM
Pulse Code Modulation의 약자. 압축되지 않은 원시 오디오 데이터 형식으로, 가장 높은 품질을 제공하지만 파일 크기가 큽니다.

### AAC
Advanced Audio Coding의 약자. 고품질 오디오 코덱으로, MP4 컨테이너와 함께 자주 사용됩니다.

---

## 보안

### Secure Context
HTTPS 또는 localhost 환경을 의미합니다. `getUserMedia()` 등 민감한 API는 Secure Context에서만 사용할 수 있습니다.

---

## WebSocket

### onmessage
WebSocket에서 메시지를 수신했을 때 발생하는 이벤트. `ws.onmessage = (event) => {}` 형태로 설정하며, `event.data`로 데이터에 접근합니다.

### .readyState
WebSocket의 현재 연결 상태를 나타내는 속성. `CONNECTING(0)`, `OPEN(1)`, `CLOSING(2)`, `CLOSED(3)` 값을 가집니다.

### .code
WebSocket 연결이 닫힐 때 전달되는 상태 코드. 정상 종료는 1000, 프로토콜 오류는 1002 등으로 표현됩니다.

### .reason
WebSocket 연결이 닫힌 이유를 나타내는 문자열. 서버나 클라이언트가 연결 종료 사유를 전달할 수 있습니다.

### .wasClean
WebSocket 연결이 정상적으로 종료되었는지를 나타내는 boolean 속성. `true`면 정상 종료, `false`면 비정상 종료입니다.

### .data
이벤트나 메시지 객체의 데이터 속성. WebSocket의 `onmessage` 이벤트에서는 수신한 데이터(문자열 또는 ArrayBuffer)를 포함합니다.

### btoa
바이너리 데이터를 Base64 인코딩된 문자열로 변환하는 함수. `btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))` 형태로 사용할 수 있습니다.

---

## 기타

### framecharcode
정확한 용어를 확인하지 못했습니다. WebSocket의 프레임 인코딩과 관련된 용어일 수 있으나, 표준 API에서는 확인되지 않습니다.

### oniontype
정확한 용어를 확인하지 못했습니다. 이벤트 타입과 관련된 용어일 수 있으나, 표준 API에서는 확인되지 않습니다.

### redis가 필요한 이유?
실시간 오디오 스트리밍 시스템에서 Redis는 다음과 같은 용도로 사용될 수 있습니다:
- 세션 관리: WebSocket 연결 상태와 사용자 세션 정보 저장
- 메시지 큐: 오디오 청크를 임시로 버퍼링하여 순서 보장
- 캐싱: STT 결과나 메타데이터를 캐싱하여 성능 향상
- Pub/Sub: 여러 서버 인스턴스 간 실시간 메시지 브로드캐스팅

---

## 참고사항

- 중복된 키워드는 한 번만 설명했습니다.
- 오타는 수정하여 정확한 용어로 설명했습니다 (예: gerUserMedia → getUserMedia, OverContraintsError → OverConstrainedError, DOMEException → DOMException, Unit8Array → Uint8Array, readState → readyState, wasclon → wasClean).
- 일부 불명확한 키워드(framecharcode, oniontype)는 조사 후에도 정확한 용어를 확인하지 못해 별도로 표기했습니다.

