from fastapi import FastAPI, Form, Response, Request, HTTPException, WebSocket
from twilio.twiml.messaging_response import MessagingResponse
from twilio.request_validator import RequestValidator
from fastapi.responses import HTMLResponse

import os
import asyncio

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
        <script>
            var ws = new WebSocket("ws://localhost:8000/ws");
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
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
    while True:
        message = await queue.get()
        await websocket.send_text(f"{message[0]} said: {message[1]}")


@app.post("/sms")
async def chat(
    request: Request, From: str = Form(...), Body: str = Form(...)):
    validator = RequestValidator("key goes here")
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
