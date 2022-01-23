from fastapi import FastAPI, Form, Response, Request, HTTPException, WebSocket
from twilio.twiml.messaging_response import MessagingResponse
from twilio.request_validator import RequestValidator
from fastapi.responses import HTMLResponse

from twilio.rest import Client

import os
import asyncio

account_sid = "sid"
auth_token = "token"

client = Client(account_sid, auth_token)

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


queue = asyncio.Queue()

app = FastAPI()


@app.get("/")
async def root():
    return HTMLResponse(html)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()

    async def receive_text():
        while True:
            new_text = await queue.get()
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

    queue.put_nowait((From, Body))

    msg = response.message(f"Hi {From}, you said: {Body}")
    return Response(content=str(response), media_type="application/xml")
