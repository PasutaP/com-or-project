const functions = require('firebase-functions')
const admin = require('firebase-admin')
const config = require('./config.js')
const line = require('@line/bot-sdk')
const express = require('express')

admin.initializeApp(functions.config().firebase)

const client = new line.Client(config)

const app = express()

app.post('/webhook', line.middleware(config), (req, res) => {

    console.log(req.body.events)
    if (!Array.isArray(req.body.events)) {
        return res.status(500).end();
    }

    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
    res.status(200)

});

function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    // create a echoing text message
    const echo = { type: 'text', text: event.message.text };

    // use reply API
    client.replyMessage(event.replyToken, echo);
}

exports.app = functions.https.onRequest(app)
