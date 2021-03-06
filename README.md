# Homeless

This is one of parts in the Computer Organisation and Assembly Programming project.

# Introduction

## What is Homeless?

Homeless is the hotel room management integrated with Raspberry Pi, Google Assistant and LINE Messaging API which covers these operations.
* Room security - door unlocking
* Room controlling - lights and air conditioner controlling
* Room devices monitoring - devices monitoring screen using web browser

## Technologies

### LINE chatbot
* LINE Messaging API
* Firebase Cloud Functions (HTTP function)
* [Github repository](https://github.com/arut-ji/com-or-project)

### Google Assistant (Actions on Google)
* Actions on Google SDK
* Dialogflow
* Firebase Cloud Functions (HTTP function)
* [Github repository](https://github.com/arut-ji/action-on-google-com-or-project)

### Room Monitoring
* Firebase Hosting
* Vue.js
* [Github repository](https://github.com/arut-ji/smart-room-controlling-system/tree/master/com-or-monitor/com-or-monitor)

### Room Controller
* Raspberry PI
* Heroku Cloud MQTT
* Node.js
* WiringPi (Assembly language with ARM v.7)
* [Firebase Cloud functions (Realtime Database Background Trigger Function)](https://github.com/arut-ji/smart-room-controlling-system/tree/master/background-trigger-com-or)
* [Github Repository](https://github.com/arut-ji/com-or-rpi)

### Architecture Flowchart

![alt text](https://seniority-line-bot.firebaseapp.com/static/architecture.png)

## Authors
* **Pasuta Paopun** 
* **Arut Jinadit**
