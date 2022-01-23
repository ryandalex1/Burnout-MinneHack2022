from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, TIMESTAMP, Float
from sqlalchemy.orm import relationship

from .database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sent_from = Column(String, index=True)
    sent_to = Column(String, index=True)
    message_text = Column(String)
    owner_id = Column(Integer, ForeignKey("sessions.id"))
    owner = relationship("Session", back_populates="items")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    access_code = Column(String, index=True)
    assigned_phone_number = Column(String, index=True)
    valid_until_time = Column(Float)
    items = relationship("Message", back_populates="owner")