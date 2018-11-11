const functions = require('firebase-functions')
const admin = require('firebase-admin')
const config = require('./config.js')
const line = require('@line/bot-sdk')

admin.initializeApp(functions.config().firebase)

const client = new line.Client(config)

exports.webhook = functions.https.onRequest((req, res) => {
    if (!Array.isArray(req.body.events)) {
        res.status(500).end();
    }
    Promise
        .all(req.body.events.map((event) => {
            console.log('event', event);
            // check verify webhook event
            if (event.replyToken === '00000000000000000000000000000000' ||
                event.replyToken === 'ffffffffffffffffffffffffffffffff') {
                return;
            }
            handleEvent(event)
        }))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
    res.status(200)
})

function handleEvent(event) {
    const echo = { type: 'text', text: event.message.text };
    client.replyMessage(event.replyToken, echo);
}


