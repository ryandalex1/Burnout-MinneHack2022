from fastapi import FastAPI, Form, Response, Request, HTTPException, WebSocket
from fastapi.responses import HTMLResponse
from twilio.twiml.messaging_response import MessagingResponse
from twilio.request_validator import RequestValidator
from twilio.rest import Client

import asyncio
import string
import random
import time

SESSION_LENGTH_MINUTES = 5
ACCESS_CODE_LENGTH = 6
account_sid = "sid"
auth_token = "token"

all_phone_numbers = ["+16204729736"]
available_phone_numbers = ["+16204729736"]

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

client = Client(account_sid, auth_token)
app = FastAPI()


def create_code():
    possible_values = string.ascii_uppercase + string.digits
    result_str = ''.join(random.choice(possible_values) for i in range(ACCESS_CODE_LENGTH))
    return result_str

@app.get("/")
async def root():
    return HTMLResponse(html)


@app.post("/create-session/")
async def create_message_session():
    if len(available_phone_numbers) == 0:
        raise HTTPException(status_code=404, detail="Phone number not found")
    next_code = create_code()
    next_number = available_phone_numbers.pop()
    current_time = time.time() + (60 * SESSION_LENGTH_MINUTES)
    access_codes[next_code] = (next_number, current_time)
    return {"access_code": next_code, "next_number": next_number, "valid_until_time": current_time}


@app.get("/{user_id}")
async def show_message_interface(user_id: str):
    if user_id not in access_codes.keys():
        raise HTTPException(status_code=404, detail="Access code not found")
    return {"phone_number": access_codes[user_id][0], "valid_until_time": access_codes[user_id][1]}


@app.delete("/end/")
async def delete_session(user_id: str):
    if user_id not in access_codes.keys():
        raise HTTPException(status_code=404, detail="Access code does not exist")
    freed_phone_number = access_codes[user_id][0]
    available_phone_numbers.append(freed_phone_number)
    del access_codes[user_id]
    return


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    async def receive_text():
        while True:
            new_text = await incoming_message_queue.get()
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
async def chat(request: Request, From: str = Form(...), Body: str = Form(...)):
    validator = RequestValidator(auth_token)
    form_ = await request.form()
    if not validator.validate(
            str(request.url),
            form_,
            request.headers.get("X-Twilio-Signature", "")):
        raise HTTPException(status_code=400, detail="Error in Twilio Signature")

    response = MessagingResponse()

    incoming_message_queue.put_nowait((From, Body))

    msg = response.message(f"Hi {From}, you said: {Body}")
    return Response(content=str(response), media_type="application/xml")
