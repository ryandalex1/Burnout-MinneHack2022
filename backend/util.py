from typing import Dict
from fastapi import WebSocket

import string
import random
import asyncio
import time

from .schema import Session
from .schema import Message

ACCESS_CODE_LENGTH = 6


# TODO support multiple simultaneous connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.live_message_queues = {}

    async def connect(self, websocket: WebSocket, session: Session):
        if session.access_code in self.active_connections:
            pass
        else:
            await websocket.accept()
            self.active_connections[session.access_code] = websocket
            self.live_message_queues[session.access_code] = asyncio.Queue()

    def disconnect(self, access_code: str):
        try:
            del self.active_connections[access_code]
            del self.live_message_queues[access_code]
        except KeyError:
            pass

    def gift_message(self, access_code: str, message: Message):
        print(f"gifting to {access_code}")
        self.live_message_queues[access_code].put_nowait(message)
        print(self.live_message_queues[access_code].qsize())

    async def get_message_from_queue(self, access_code: str):
        return await self.live_message_queues[access_code].get()


def create_code():
    possible_values = string.ascii_uppercase + string.digits
    result_str = ''.join(random.choice(possible_values) for i in range(ACCESS_CODE_LENGTH))
    return result_str
