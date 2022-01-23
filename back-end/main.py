from fastapi import FastAPI, Form, Request, HTTPException, WebSocket, Depends, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from twilio.request_validator import RequestValidator
from twilio.rest import Client

import uvicorn

import asyncio
import time

from .crud_operations import *
from . import models
from .database import SessionLocal, engine

from .util import *

SESSION_LENGTH_MINUTES = 5

account_sid = "sid"
auth_token = "token"

all_phone_numbers = ["+16204729736", "+19525229522", "+16124533184", "+16514101883", "+18055905233"]
available_phone_numbers = []

live_message_queues = {}

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
ws_manager = ConnectionManager()


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


@app.on_event("shutdown")
async def shutdown_event(db: Session = Depends(get_db)):
    delete_all_sessions(db=db)


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
    return create_session(db=db, access_code=next_code, phone_number=next_number,
                                          valid_until_time=current_time)


@app.get("/{user_id}")
async def show_message_interface(user_id: str, db: Session = Depends(get_db)):
    user_session = get_session(db=db, access_code=user_id)
    if user_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    session_messages = get_messages(db=db, session_id=user_session.id)
    return {"session": user_session, "messages": session_messages}


# TODO test that this works
@app.delete("/end/")
async def delete_session(access_code: str, db: Session = Depends(get_db)):
    user_session = get_session(db=db, access_code=access_code)
    if user_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    freed_phone_number = user_session.assigned_phone_number
    available_phone_numbers.append(freed_phone_number)
    await delete_session(db, access_code)
    return


# TODO different websocket for each session
@app.websocket("/ws/{access_code}")
async def websocket_endpoint(websocket: WebSocket, access_code: str, db: Session = Depends(get_db)):
    await ws_manager.connect(websocket)

    async def receive_text():
        try:
            while True:
                new_text_id = await live_message_queues[access_code].get()
                text_json = get_message(db, new_text_id)
                await websocket.send_json(text_json)
        except WebSocketDisconnect:
            ws_manager.disconnect(websocket)

    async def send_text():
        try:
            while True:
                sent_message = await websocket.receive_json()
                message = client.messages.create(
                    body=sent_message["body"],
                    from_=sent_message["from"],
                    to=sent_message["to"]
                )
        except WebSocketDisconnect:
            # TODO idk about this
            pass

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

    # TODO check if connection is open in websockets
    if current_session.access_code not in live_message_queues:
        live_message_queues[current_session.access_code] = asyncio.Queue()
    live_message_queues[current_session.access_code].put_nowait(new_message.id)

    return


if __name__ == "__main__":

    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
