"""
Django 서버 예제: WebSocket으로 실시간 오디오 STT 처리

이 파일은 Django Channels를 사용한 WebSocket Consumer 예제입니다.
실제 프로젝트에 맞게 수정하여 사용하세요.
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)


class AudioSTTConsumer(AsyncWebsocketConsumer):
    """
    실시간 오디오 STT 처리를 위한 WebSocket Consumer
    
    클라이언트로부터 오디오 데이터를 받아 STT 처리 후 결과를 전송합니다.
    """
    
    async def connect(self):
        """WebSocket 연결 시 호출"""
        await self.accept()
        self.sequence = 0
        self.audio_buffer = bytearray()
        self.mime_type = None
        logger.info("WebSocket 연결됨")

    async def disconnect(self, close_code):
        """WebSocket 연결 종료 시 호출"""
        logger.info(f"WebSocket 연결 종료: {close_code}")
        self.audio_buffer = bytearray()

    async def receive(self, text_data=None, bytes_data=None):
        """
        클라이언트로부터 메시지 수신
        
        Args:
            text_data: JSON 텍스트 메시지
            bytes_data: 이진 데이터 (오디오 청크)
        """
        if text_data:
            # JSON 메시지 처리
            try:
                data = json.loads(text_data)
                await self.handle_text_message(data)
            except json.JSONDecodeError as e:
                logger.error(f"JSON 파싱 실패: {e}")
                await self.send_error("JSON 파싱 실패")
        
        elif bytes_data:
            # 이진 데이터 처리 (오디오 청크)
            await self.handle_audio_chunk(bytes_data)

    async def handle_text_message(self, data: dict):
        """
        텍스트 메시지 처리
        
        Args:
            data: 파싱된 JSON 데이터
        """
        message_type = data.get('type')
        
        if message_type == 'start':
            # 녹음 시작
            self.mime_type = data.get('mimeType', 'audio/webm')
            self.audio_buffer = bytearray()
            self.sequence = 0
            
            config = data.get('config', {})
            logger.info(f"녹음 시작: mimeType={self.mime_type}, config={config}")
            
            # 연결 확인 메시지 전송
            await self.send(text_data=json.dumps({
                'type': 'connected',
                'data': '녹음 시작됨',
            }))
            
        elif message_type == 'end':
            # 녹음 종료
            logger.info("녹음 종료")
            
            # 마지막 버퍼 처리
            if len(self.audio_buffer) > 0:
                await self.process_audio(self.audio_buffer)
            
            self.audio_buffer = bytearray()
            
        elif message_type == 'audio':
            # 오디오 청크 메타데이터
            sequence = data.get('sequence', 0)
            size = data.get('size', 0)
            logger.debug(f"오디오 청크 메타데이터: sequence={sequence}, size={size}")

    async def handle_audio_chunk(self, bytes_data: bytes):
        """
        오디오 청크 처리
        
        Args:
            bytes_data: 오디오 데이터 (bytes)
        """
        # 버퍼에 추가
        self.audio_buffer.extend(bytes_data)
        self.sequence += 1
        
        # 일정 크기마다 STT 처리 (예: 16KB)
        # 또는 주기적으로 처리하려면 타이머 사용
        if len(self.audio_buffer) >= 16000:  # 16KB
            await self.process_audio(self.audio_buffer)
            # 처리한 부분은 버퍼에서 제거하거나 새로 시작
            # 여기서는 간단히 버퍼를 비움 (실제로는 슬라이딩 윈도우 사용 권장)
            self.audio_buffer = bytearray()

    async def process_audio(self, audio_data: bytearray):
        """
        오디오 데이터를 STT 처리
        
        Args:
            audio_data: 오디오 데이터
        """
        try:
            logger.info(f"오디오 처리 시작: {len(audio_data)} bytes")
            
            # STT 처리 (비동기)
            transcription = await self.run_stt(bytes(audio_data))
            
            # 결과를 클라이언트로 전송
            await self.send(text_data=json.dumps({
                'type': 'transcription',
                'data': transcription,
                'sequence': self.sequence,
            }))
            
            logger.info(f"전사 결과 전송: {transcription}")
            
        except Exception as e:
            logger.error(f"STT 처리 실패: {e}", exc_info=True)
            await self.send_error(f"STT 처리 실패: {str(e)}")

    @sync_to_async
    def run_stt(self, audio_data: bytes) -> str:
        """
        실제 STT 처리 (동기 함수를 비동기로 실행)
        
        여기에 실제 STT 서비스를 연동하세요:
        - Google Speech-to-Text API
        - OpenAI Whisper API
        - Azure Speech Services
        - 로컬 Whisper 모델 등
        
        Args:
            audio_data: 오디오 데이터 (bytes)
            
        Returns:
            전사 결과 (str)
        """
        # TODO: 실제 STT 서비스 연동
        # 예시:
        # from google.cloud import speech
        # client = speech.SpeechClient()
        # ...
        
        # 임시로 더미 응답
        return f"전사 결과 (시퀀스: {self.sequence}, 크기: {len(audio_data)} bytes)"

    async def send_error(self, message: str):
        """에러 메시지 전송"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'data': message,
        }))


# ============================================
# URL 라우팅 설정 (routing.py)
# ============================================

"""
# myapp/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/audio/$', consumers.AudioSTTConsumer.as_asgi()),
]
"""

# ============================================
# ASGI 설정 (asgi.py)
# ============================================

"""
# myproject/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import myapp.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            myapp.routing.websocket_urlpatterns
        )
    ),
})
"""

# ============================================
# settings.py 설정
# ============================================

"""
# settings.py
INSTALLED_APPS = [
    # ...
    'channels',
    'django.contrib.staticfiles',
]

ASGI_APPLICATION = 'myproject.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
        # 프로덕션에서는 Redis 사용 권장
        # 'BACKEND': 'channels_redis.core.RedisChannelLayer',
        # 'CONFIG': {
        #     "hosts": [('127.0.0.1', 6379)],
        # },
    },
}
"""

# ============================================
# 설치 필요 패키지
# ============================================

"""
pip install channels
pip install channels-redis  # Redis 사용 시
"""

