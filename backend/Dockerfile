FROM python:3.9-slim

RUN apt-get update && apt-get install -y python3-dev libpq-dev build-essential

WORKDIR /app
RUN mkdir /backend

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . ./backend

# EXPOSE 8000

ENTRYPOINT [ "python", "-m", "backend" ]