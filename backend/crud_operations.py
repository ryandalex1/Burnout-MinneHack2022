from sqlalchemy.orm import Session

from . import models


def get_session(db: Session, access_code: str):
    return db.query(models.Session).filter(models.Session.access_code == access_code).first()


def get_session_by_phone_num(db: Session, phone_number: str):
    return db.query(models.Session).filter(models.Session.assigned_phone_number == phone_number).first()


def create_session(db: Session, access_code: str, phone_number: str, valid_until_time: float):
    db_session = models.Session(access_code=access_code, assigned_phone_number=phone_number,
                                valid_until_time=valid_until_time)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def delete_session(db: Session, access_code: str):
    session_to_delete = get_session(db, access_code)
    db.delete(session_to_delete)
    db.flush()


def delete_all_sessions(db: Session):
    for session in db.query(models.Session).all():
        db.delete(session)
    db.flush()


def get_messages(db: Session, session_id: int):
    return db.query(models.Message).filter(models.Message.owner_id == session_id).all()


def get_message(db: Session, message_id: int):
    return db.query(models.Message).filter(models.Message.id == message_id).all()


def create_session_message(db: Session, sent_from: str, sent_to: str, message_text: str, session_id: int):
    db_message = models.Message(sent_from=sent_from, sent_to=sent_to, message_text=message_text, owner_id=session_id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
