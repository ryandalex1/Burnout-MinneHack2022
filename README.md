<img src="https://i.imgur.com/NciLpig.png" alt="drawing" width="200"/>

# Burnout

This project was created in 24 hours for the MinneHack2022 Hackathon on January 22nd and 23rd 2022.

![Imgur](https://i.imgur.com/XeVIqZ9.png)

Burnout won 2nd place overall and won a prize for the most creative use of Twilio.

[Demo Video Presentation](https://www.youtube.com/watch?v=dG6ecFNn-Ak)

[DevPost Page](https://devpost.com/software/burnout-8q0ula)

[Live Link](https://burnout-frontend-qwqi2iy3qa-uc.a.run.app) (Probably not working when you click on this)

## Inspiration
Whether it is a Craigslist seller or a website that needs you to verify with a one-time code, oftentimes we are forced to give up our anonymity online and sacrifice our digital privacy by giving out our real phone number. Existing solutions are either prohibitively expensive or hard to make work. Burnout makes temporary phone number anonymity accessible to everyone with the single click of a button in your browser.

## What it does
Burnout allows anyone to temporarily use an anonymous phone number in their browser. A user can create a session and will be given a phone number to use. They can give this phone number out and then send and receive texts from within their browser for a given time period. They are also given a code to sign back into their session from a different device at a later time.

For example, if a website needs to send you a one-time code to verify your identity, you can stay anonymous by creating a session with Burnout and sending the code to your temporary phone number.

## How we built it
We built Burnout as a full-stack web app using a FastAPI backend written in Python and an Angular frontend written in TypeScript and JavaScript. We relied heavily on Twilio to facilitate the sending and receiving of messages and for setting up the anonymous phone numbers. We used WebSockets to allow messages to be communicated live into the frontend when the backend receives them from the Twilio. We also used PostgreSQL to temporarily store messages (if a user starts a session, closes their computer, and then later logs back into the session, they should see any messages that they missed in the interim). We also store which sessions are controlling which numbers in our PostgreSQL database.

## Challenges we ran into and how we solved them
### Challenge 1: Allowing the website to concurrently handle multiple clients
We were forced to rewrite some of our WebSocket connection code to allow the server to talk to multiple clients at the same time.

### Challenge 2: Routing messages from the Twilio API through WebSockets into the Front-End

We ran into a lot of different issues making this work. Although the Twilio API worked rather reliably, there were some problems getting the webhooks to work as we wanted. As mentioned below, there were issues setting this up locally and then more problems actually getting the data we wanted from the webhook request. Even after the data made it into the backend, there were many many issues connecting the WebSockets and making sure each message was sent to the right client. Oftentimes this broke for various reasons that were hard to debug.

### Challenge 3: Setting up a working development environment with Twilio 
The problem was that we must use webhooks to receive texts that are sent to a Twilio number. This was problematic because there is not a way to get Twilio to send requests to your computer directly. The solution was to use Ngrok -- a service that allows requests to a URL to be redirected to localhost.

## Accomplishments that we're proud of
1. Creating Our Presentation Video and learning how to use Design and Editing Software

2. Getting the Twilio API message to show up on the website in real-time, live on the Front-End using WebSockets 

3. Using Google Cloud Run for the first time and getting the website hosted

## What we learned
We learned how to create a usable API that was able to tie together other APIs to create a usable website within the time limit. We worked with the following technologies:

1. Angular - We already had experience with Angular, but it allowed for the quick and efficient creation of a user interface that looked good by implementing Material Design

2. FastAPI - None of us had a lot of experience with FastAPI but we did have experience with Python. This project gave us a chance to learn FastAPI and actually deploy it alongside a usable frontend. It was not too bad to get up and running with some basic routes but we learned a lot connecting it to the front end via WebSockets and working with some of the async functions and operations.

3. PostgreSQL - We had worked with PostgreSQL, but had not used SQLAlchemy and Pydantic to connect it with Python before. We also were able to work with Docker to run our development database easily.

4. Twilio API - The Twilio API sits at the core of Burnout, allowing us to have usable phone numbers integrated into our website. Using Twilio, we were able to integrate the phone conversations into the browser in real time

## What's next for Burnout
This project is not under active development post-hackathon.
