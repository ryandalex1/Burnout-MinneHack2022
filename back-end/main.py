from fastapi import FastAPI, Form, Response, Request, HTTPException, WebSocket, Depends
from fastapi.responses import HTMLResponse
from twilio.twiml.messaging_response import MessagingResponse
from twilio.request_validator import RequestValidator
from twilio.rest import Client

import asyncio
import string
import random
import time

from sqlalchemy.orm import Session

from . import crud_operations, models, schema
from .database import SessionLocal, engine

SESSION_LENGTH_MINUTES = 5
ACCESS_CODE_LENGTH = 6

account_sid = "sid"
auth_token = "token"

all_phone_numbers = ["+16204729736", "+19525229522", "+16124533184", "+16514101883", "+18055905233"]
available_phone_numbers = []

incoming_message_queue = asyncio.Queue()
access_codes = {}

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>Burnout</h1>
        <ul id='messages'>
        </ul>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <script>
            var ws = new WebSocket("ws://localhost:8000/ws");
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""

models.Base.metadata.create_all(bind=engine)
client = Client(account_sid, auth_token)
app = FastAPI()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_code():
    possible_values = string.ascii_uppercase + string.digits
    result_str = ''.join(random.choice(possible_values) for i in range(ACCESS_CODE_LENGTH))
    return result_str


@app.on_event("startup")
async def startup_event():
    for number in all_phone_numbers:
        available_phone_numbers.append(number)


@app.on_event("shutdown")
async def shutdown_event():
    # TODO clear all sessions from db when app ends
    pass


@app.get("/")
async def root():
    return HTMLResponse(html)


@app.post("/create-session/")
async def create_message_session(db: Session = Depends(get_db)):
    if len(available_phone_numbers) == 0:
        raise HTTPException(status_code=404, detail="Phone number not found")
    next_code = create_code()
    next_number = available_phone_numbers.pop()
    current_time = time.time() + (60 * SESSION_LENGTH_MINUTES)
    return crud_operations.create_session(db=db, access_code=next_code, phone_number=next_number,
                                          valid_until_time=current_time)


@app.get("/{user_id}")
async def show_message_interface(user_id: str, db: Session = Depends(get_db)):
    user_session = crud_operations.get_session(db=db, access_code=user_id)
    if user_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    session_messages = crud_operations.get_messages(db=db, session_id=user_session.id)
    return {"session": user_session, "messages": session_messages}


# TODO test that this works
@app.delete("/end/")
async def delete_session(access_code: str, db: Session = Depends(get_db)):
    user_session = crud_operations.get_session(db=db, access_code=access_code)
    if user_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    freed_phone_number = user_session.assigned_phone_number
    available_phone_numbers.append(freed_phone_number)
    crud_operations.delete_session(db, access_code)
    return


# TODO different websocket for each session?
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()

    async def receive_text():
        while True:
            new_text = await incoming_message_queue.get()
            print("received")
            crud_operations.create_session_message(db=db,
                                                   sent_to=new_text[2],
                                                   sent_from=new_text[0],
                                                   message_text=new_text[1],
                                                   session_id=crud_operations.get_session_by_phone_num(db=db, phone_number=new_text[2]))
            print("in db?")
            await websocket.send_text(f"{new_text[0]} said: {new_text[1]}")

    async def send_text():
        while True:
            sent_text = await websocket.receive_text()
            await websocket.send_text(f"{+16204729736} said: {sent_text}")
            message = client.messages.create(
                body=sent_text,
                from_='+16204729736',
                to='+15134841608'
            )

    receive_task = asyncio.create_task(receive_text())
    send_task = asyncio.create_task(send_text())

    await send_task
    await receive_task


@app.post("/sms")
async def chat(request: Request, From: str = Form(...), To: str = Form(...), Body: str = Form(...), db: Session = Depends(get_db)):
    validator = RequestValidator(auth_token)
    form_ = await request.form()
    current_session_id = crud_operations.get_session_by_phone_num(db=db, phone_number=To)
    new_message = crud_operations.create_session_message(db=db, sent_to=To, sent_from=From, message_text=Body,
                                                         session_id=current_session_id.id)
    # TODO put to right queue
    incoming_message_queue.put_nowait((From, Body, To))
    return
