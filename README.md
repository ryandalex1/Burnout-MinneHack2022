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
We built Burnout as a full-stack web app using a FastAPI backend written in Python and an Angular frontend written in Javascript. We relied heavily on Twilio to facilitate the sending and receiving of messages and for setting up the anonymous phone numbers. We used WebSockets to allow messages to be communicated live into the frontend when the backend receives them from the Twilio. We also used PostgreSQL to temporarily store messages (if a user starts a session, closes their computer, and then later logs back into the session, they should see any messages that they missed in the interim). We also store which sessions are controlling which numbers in our PostgreSQL database.

## Challenges we ran into and how we solved them
Challenge 1: Allowing the website to concurrently handle multiple clients

Challenge 2: Routing messages from the Twilio API through WebSockets into the Front-End

Challenge 3: Setting up a working development environment with Twilio The problem was that we must use webhooks to receive texts that are sent to a Twilio number. This was problematic because there is not a way to get Twilio to send requests to your computer directly. The solution was to use Ngrok -- a service that allows requests to a URL to be redirected to localhost.

## Accomplishments that we're proud of
1: Creating Our Presentation Video and learning how to use Design and Editing Softwares 2: Getting the Twilio API message to show up on the website in real-time, live on the Front-End using WebSockets 3: Using Google Cloud Run for the first time and getting the website hosted

## What we learned
In general, We learned how to use a number of APIs to create a usable website within the time limit including the ones following: 1:Angular - Angular essentially allowed for the creation of a quick and efficient user interface, which is necessary when dealing with real-time events like text messages 2: Twilio API -Twilio API sits at the core of our Project, allowing us to have web-based phone numbers integrated into our website. Through the usage of Twilio, we were able to integrate the phone interactions into the Back-End and 3: Sequel Alchemy -Sequel Alchemy is used to store session information, including temporarily storing text messages: Sequel Alchemy allowed for us to save user information between sessions with a given user code 4: Fast API - Fast API was crucial in creating efficient software and for reducing the lag that the user may experience 5: WebSockets - WebSockets allows us to update the Front-End display with texts and information from the server in real-time Websockets interacts with the Twilio API and allows for the Back- End to update the display on the Front-End with texts and time remaining

## What's next for Burnout
With more time and energy, the main area of expansion would be to purchase a number of new phone numbers, as the current data formats and programs used are able to scale effectively


## Try it out
burnout-frontend-qwqi2iy3qa-uc.a.run.app
