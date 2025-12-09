# MediaStream과 WebSocket을 활용한 실시간 오디오 스트리밍 교과서

## 📚 목차

이 교과서는 브라우저에서 마이크 오디오를 실시간으로 Django 서버에 전송하는 전체 과정을 단계별로 설명합니다.

### Chapter 1: MediaStream과 getUserMedia 기초

- MediaStream의 개념 이해
- getUserMedia()를 통한 마이크 접근
- Constraints를 활용한 미디어 제어
- 에러 처리 방법

### Chapter 2: MediaRecorder로 오디오 캡처하기

- MediaRecorder API 소개
- 오디오 데이터 수집 방법
- 실시간 청크 단위 캡처
- MIME 타입과 코덱 선택

### Chapter 3: Blob과 ArrayBuffer 이해하기

- Blob과 ArrayBuffer의 차이
- 데이터 형식 변환
- WebSocket 전송을 위한 데이터 준비
- 메모리 관리

### Chapter 4: WebSocket 연결 및 실시간 전송

- WebSocket 프로토콜 이해
- 네이티브 WebSocket API 사용
- 이진 데이터 전송
- 연결 상태 관리 및 재연결

### Chapter 5: 통합 예제 및 실전 패턴

- 전체 파이프라인 통합
- Django 서버 연동
- 에러 처리 전략
- 성능 최적화

### 부록: 용어집 및 참고 자료

- 주요 용어 정리
- 브라우저 호환성
- 추가 학습 자료

## 🎯 학습 목표

이 교과서를 완료하면 다음을 할 수 있습니다:

1. **개념 이해**: MediaStream과 WebSocket의 동작 원리를 설명할 수 있습니다.
2. **실습 가능**: 제공된 코드를 따라하며 실시간 오디오 스트리밍을 구현할 수 있습니다.
3. **실전 적용**: Django 서버와 연동하여 실시간 STT 서비스를 구축할 수 있습니다.

## 📖 사용 방법

1. 각 챕터를 순서대로 읽으세요.
2. 문서 내 인라인 코드를 이해하세요.
3. `codes/` 폴더의 완전한 예제를 실행해보세요.
4. 각 챕터의 연습 문제를 풀어보세요.

## 🔧 사전 요구사항

- TypeScript 기본 지식
- 비동기 프로그래밍 (Promise, async/await) 이해
- 웹 브라우저 API 기본 지식

## 📝 참고

- 모든 예제 코드는 TypeScript로 작성되었습니다.
- 브라우저에서 실행하기 위해 HTML 파일도 함께 제공됩니다.
- Django 서버 연동 예제는 Python 코드로 제공됩니다.
