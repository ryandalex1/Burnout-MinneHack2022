from typing import List
from fastapi import WebSocket

import string
import random


ACCESS_CODE_LENGTH = 6


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)


def create_code():
    possible_values = string.ascii_uppercase + string.digits
    result_str = ''.join(random.choice(possible_values) for i in range(ACCESS_CODE_LENGTH))
    return result_str
