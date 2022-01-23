from typing import List
from pydantic import BaseModel


class MessageBase(BaseModel):
    sent_from: str
    sent_to: str
    message_text: str
    # TODO: timestamp

class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True


class SessionBase(BaseModel):
    assigned_phone_number: str
    valid_until_time: float
    access_code: str


class SessionCreate(SessionBase):
    pass


class Session(SessionBase):
    id: int
    messages: List[Message] = []

    class Config:
        orm_mode = True