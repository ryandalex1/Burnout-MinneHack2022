from fastapi import FastAPI, Form, Request, HTTPException, WebSocket, Depends, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from twilio.request_validator import RequestValidator
from twilio.rest import Client

import os
import uvicorn

import asyncio
import time

from backend.crud_operations import *
from backend import models
from backend.database import SessionLocal, engine

from .util import *

SESSION_LENGTH_MINUTES = 5

account_sid = os.environ["BURNOUT_TWILIO_ACCOUNT_SID"]
auth_token = os.environ["BURNOUT_TWILIO_AUTH_TOKEN"]

all_phone_numbers = ["+16204729736", "+19525229522", "+16124533184", "+16514101883", "+18055905233"]
available_phone_numbers = []

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

origins = [ "*" ]

# TODO use alembic maybe idk
models.Base.metadata.create_all(bind=engine)
client = Client(account_sid, auth_token)
app = FastAPI()
ws_manager = ConnectionManager()


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    for number in all_phone_numbers:
        available_phone_numbers.append(number)


@app.get("/")
async def root():
    return HTMLResponse(html)


@app.post("/create-session/")
async def create_message_session(db: Session = Depends(get_db)):
    if len(available_phone_numbers) == 0:
        raise HTTPException(status_code=404, detail="Phone number not found")
    next_code = create_code()
    next_number = available_phone_numbers.pop()
    seconds_until_expiry = (60 * SESSION_LENGTH_MINUTES)
    current_time = time.time() + seconds_until_expiry

    ret = create_session(db=db, access_code=next_code, phone_number=next_number,
                         valid_until_time=current_time)

    async def expire_session():
        await asyncio.sleep(seconds_until_expiry)
        ws_manager.disconnect(next_code)
        freed_phone_number = next_number
        available_phone_numbers.append(freed_phone_number)
        delete_session(db, next_code)
    asyncio.create_task(expire_session())

    return ret


@app.get("/{user_id}")
async def show_message_interface(user_id: str, db: Session = Depends(get_db)):
    user_session = get_session(db=db, access_code=user_id)
    if user_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    session_messages = get_messages(db=db, session_id=user_session.id)
    return {"session": user_session, "messages": session_messages}


# TODO test that this works
@app.delete("/end/")
async def delete_session_route(access_code: str, db: Session = Depends(get_db)):
    user_session = get_session(db=db, access_code=access_code)
    if user_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    freed_phone_number = user_session.assigned_phone_number
    available_phone_numbers.append(freed_phone_number)
    delete_session(db, access_code)
    return


@app.websocket("/ws/{access_code}")
async def websocket_endpoint(websocket: WebSocket, access_code: str, db: Session = Depends(get_db)):
    session = get_session(db, access_code)
    await ws_manager.connect(websocket, session)

    async def receive_text():
        try:
            while True:
                print("waiting for the message to get onto the queue")
                new_text: models.Message = await ws_manager.get_message_from_queue(access_code)
                print("got the message")
                print(new_text)
                # text_json = get_message(db, new_text_id)
                await websocket.send_json({"sent_from": new_text.sent_from, "sent_to": new_text.sent_to, "message_text": new_text.message_text})
                print("sent on the websocket")

        except WebSocketDisconnect:
            ws_manager.disconnect(access_code)

    async def send_text():
        try:
            while True:
                sent_message = await websocket.receive_json()
                new_message = create_session_message(db=db, sent_to=sent_message["to"],
                                                     sent_from=session.assigned_phone_number, message_text=sent_message["body"],
                                                     session_id=session.id)
                message = client.messages.create(
                    body=sent_message["body"],
                    from_=session.assigned_phone_number,
                    to=sent_message["to"]
                )
        except WebSocketDisconnect:
            ws_manager.disconnect(access_code)

    receive_task = asyncio.create_task(receive_text())
    send_task = asyncio.create_task(send_text())

    await send_task
    await receive_task


@app.post("/sms")
async def chat(request: Request, From: str = Form(...), To: str = Form(...), Body: str = Form(...), db: Session = Depends(get_db)):
    validator = RequestValidator(auth_token)
    form_ = await request.form()

    current_session = get_session_by_phone_num(db=db, phone_number=To)
    new_message = create_session_message(db=db, sent_to=To, sent_from=From, message_text=Body,
                                         session_id=current_session.id)

    if current_session.access_code in ws_manager.active_connections:
        print("sending message to ws")
        ws_manager.gift_message(current_session.access_code, new_message)
    else:
        print("no active connection to send to")

    return


if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
