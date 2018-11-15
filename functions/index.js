const functions = require('firebase-functions')
const admin = require('firebase-admin')
const config = require('./config.js')
const line = require('@line/bot-sdk')
const url = require('url')

admin.initializeApp(functions.config().firebase)

const db = admin.database()
const ref = db.ref()

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
                return null;
            }
            return handleEvent(event)
        }))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
    res.status(200)
})

function handleEvent(event) {
    switch (event.type) {
        case 'message': {
            const echo = { type: 'text', text: event.message.text };
            return client.replyMessage(event.replyToken, echo);
        }
        case 'postback': {
            return handlePostback(event)
        }
        default:
            return client.replyMessage(event.replyToken, { type: 'text', text: event.message.text });
    }
}

async function handlePostback(event) {
    var data = url.parse('?' + event.postback.data, true).query
    console.log(data)
    const userId = event.source.userId
    console.log(userId)
    switch (data.action) {
        case 'RICHMENU': {
            return handleNavigation(data.menu, userId)
        }
        case 'DOOR_UNLOCK': {
            return handleDoorUnlock(userId)
        }
        case 'AIR': {
            return handleAirController(data, userId)
        }
        case 'LIGHT': {
            return handleLightContrtoller(data, userId)
        }
    }
    return null
}

async function sendStatusMessage(menu, roomKey) {
    const roomRef = db.ref('rooms').child(roomKey)
    const roomSnapshot = await roomRef.once("value")
    switch (menu) {
        case 'AIR_CONTROLLER': {
            const temp = roomSnapshot.val().temp
            const status = roomSnapshot.val().airStatus
            const msg = {
                "type": "flex",
                "altText": "Flex Message",
                "contents": {
                    "type": "bubble",
                    "direction": "ltr",
                    "hero": {
                        "type": "image",
                        "url": "https://firebasestorage.googleapis.com/v0/b/seniority-line-bot.appspot.com/o/flex-messages-pics%2FHomeless-06.png?alt=media&token=58776d7e-375d-41f2-b861-4413bec4f479",
                        "size": "full",
                        "aspectRatio": "20:13",
                        "aspectMode": "cover"
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "md",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "vertical",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Air Conditioner",
                                        "size": "xxl",
                                        "align": "start",
                                        "gravity": "top",
                                        "weight": "bold",
                                        "color": "#2D2926"
                                    },
                                    {
                                        "type": "box",
                                        "layout": "baseline",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Temperature",
                                                "margin": "sm",
                                                "weight": "bold"
                                            },
                                            {
                                                "type": "text",
                                                "text": `${temp}℃`,
                                                "size": "sm",
                                                "align": "end",
                                                "color": "#E08E60"
                                            }
                                        ]
                                    },
                                    {
                                        "type": "box",
                                        "layout": "baseline",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Status",
                                                "flex": 0,
                                                "margin": "sm",
                                                "weight": "bold"
                                            },
                                            {
                                                "type": "text",
                                                "text": `${status ? "ON" : "OFF"}`,
                                                "size": "sm",
                                                "align": "end",
                                                "color": "#E08E60"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
            return client.pushMessage(roomSnapshot.val().user, msg)            
        }
        case 'LIGHT_CONTROLLER': {
            const msg = {
                "type": "flex",
                "altText": "Flex Message",
                "contents": {
                    "type": "bubble",
                    "hero": {
                        "type": "image",
                        "url": "https://firebasestorage.googleapis.com/v0/b/seniority-line-bot.appspot.com/o/flex-messages-pics%2FHomeless-07.png?alt=media&token=4db4b8a7-e74e-44f8-99e3-67d443d7fdd3",
                        "margin": "none",
                        "size": "full",
                        "aspectRatio": "20:13",
                        "aspectMode": "cover",
                        "action": {
                            "type": "uri",
                            "label": "Action",
                            "uri": "https://linecorp.com"
                        }
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "md",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "vertical",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Lights",
                                        "size": "xxl",
                                        "weight": "bold"
                                    },
                                    {
                                        "type": "box",
                                        "layout": "baseline",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Bedroom",
                                                "flex": 0,
                                                "margin": "sm",
                                                "weight": "bold"
                                            },
                                            {
                                                "type": "text",
                                                "text": `${roomSnapshot.val().bedroomLightStatus ? "ON" : "OFF"}`,
                                                "size": "sm",
                                                "align": "end",
                                                "color": "#E08E60"
                                            }
                                        ]
                                    },
                                    {
                                        "type": "box",
                                        "layout": "baseline",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Bathroom",
                                                "flex": 0,
                                                "margin": "sm",
                                                "weight": "bold"
                                            },
                                            {
                                                "type": "text",
                                                "text": `${roomSnapshot.val().bathroomLightStatus ? "ON" : "OFF"}`,
                                                "size": "sm",
                                                "align": "end",
                                                "color": "#E08E60"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
            return client.pushMessage(roomSnapshot.val().user, msg)
        }
    }
    return "done"
}

async function handleLightContrtoller(data, userId) {
    const userRef = db.ref('users')
    const userSnapshot = await userRef.child(userId).once("value")
    const roomKey = userSnapshot.val().roomKey
    const roomRef = db.ref('rooms').child(roomKey)
    const status = data.status
    switch (data.room) {
        case 'BATHROOM': {
            await roomRef.child('bathroomLightStatus').transaction(currentStatus => status === "ON" ? true : false)
            break
        }
        case 'BEDROOM': {
            await roomRef.child('bedroomLightStatus').transaction(currentStatus => status === "ON" ? true : false)
            break
        }
    }
    const roomSnapshot = await roomRef.once("value")
    const msg = {
        "type": "flex",
        "altText": "Flex Message",
        "contents": {
            "type": "bubble",
            "hero": {
                "type": "image",
                "url": "https://firebasestorage.googleapis.com/v0/b/seniority-line-bot.appspot.com/o/flex-messages-pics%2FHomeless-07.png?alt=media&token=4db4b8a7-e74e-44f8-99e3-67d443d7fdd3",
                "margin": "none",
                "size": "full",
                "aspectRatio": "20:13",
                "aspectMode": "cover",
                "action": {
                    "type": "uri",
                    "label": "Action",
                    "uri": "https://linecorp.com"
                }
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "spacing": "md",
                "contents": [
                    {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "sm",
                        "contents": [
                            {
                                "type": "text",
                                "text": "Lights",
                                "size": "xxl",
                                "weight": "bold"
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Bedroom",
                                        "flex": 0,
                                        "margin": "sm",
                                        "weight": "bold"
                                    },
                                    {
                                        "type": "text",
                                        "text": `${roomSnapshot.val().bedroomLightStatus ? "ON" : "OFF"}`,
                                        "size": "sm",
                                        "align": "end",
                                        "color": "#E08E60"
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Bathroom",
                                        "flex": 0,
                                        "margin": "sm",
                                        "weight": "bold"
                                    },
                                    {
                                        "type": "text",
                                        "text": `${roomSnapshot.val().bathroomLightStatus ? "ON" : "OFF"}`,
                                        "size": "sm",
                                        "align": "end",
                                        "color": "#E08E60"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    }
    return client.pushMessage(userId, msg)
}

async function getRoomKeyByUserId(userId) {
    const userRef = db.ref('users').child(userId)
    const userSnapshot = await userRef.once("value")
    return userSnapshot.val().roomKey
}

async function handleAirController(data, userId) {
    const userRef = db.ref('users')

    const userSnapshot = await userRef.child(userId).once("value")
    const roomKey = userSnapshot.val().roomKey
    const roomRef = db.ref('rooms').child(roomKey)
    console.log(data)
    console.log(data.status)
    console.log(data.temp)
    if (data.status !== undefined) {
        if (data.status === "ON") await roomRef.update({ airStatus: true })
        else await roomRef.update({ airStatus: false })
    } else if (data.temp !== undefined) {
        if (data.temp === "UP") await roomRef.child('temp').transaction(currentTemp => currentTemp + 1)
        else await roomRef.child('temp').transaction(currentTemp => currentTemp - 1)
    }
    const roomSnapshot = await roomRef.once("value")
    const temp = roomSnapshot.val().temp
    const status = roomSnapshot.val().airStatus
    const msg = {
        "type": "flex",
        "altText": "Flex Message",
        "contents": {
            "type": "bubble",
            "direction": "ltr",
            "hero": {
                "type": "image",
                "url": "https://firebasestorage.googleapis.com/v0/b/seniority-line-bot.appspot.com/o/flex-messages-pics%2FHomeless-06.png?alt=media&token=58776d7e-375d-41f2-b861-4413bec4f479",
                "size": "full",
                "aspectRatio": "20:13",
                "aspectMode": "cover"
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "spacing": "md",
                "contents": [
                    {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "sm",
                        "contents": [
                            {
                                "type": "text",
                                "text": "Air Conditioner",
                                "size": "xxl",
                                "align": "start",
                                "gravity": "top",
                                "weight": "bold",
                                "color": "#2D2926"
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Temperature",
                                        "margin": "sm",
                                        "weight": "bold"
                                    },
                                    {
                                        "type": "text",
                                        "text": `${temp}℃`,
                                        "size": "sm",
                                        "align": "end",
                                        "color": "#E08E60"
                                    }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "baseline",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Status",
                                        "flex": 0,
                                        "margin": "sm",
                                        "weight": "bold"
                                    },
                                    {
                                        "type": "text",
                                        "text": `${status ? "ON" : "OFF"}`,
                                        "size": "sm",
                                        "align": "end",
                                        "color": "#E08E60"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    }

    return client.pushMessage(userId, msg)
}

async function handleDoorUnlock(userId) {
    await client.pushMessage(userId, { type: 'text', text: 'Unlocking ...' })
    var userRef = db.ref('users')

    const userSnapshot = await userRef.child(userId).once("value")
    console.log(userSnapshot.val())
    if (!userSnapshot.exists()) {
        var profile = await client.getProfile(userId)
        var roomRef = await db.ref('rooms').push({
            airStatus: false,
            bathroomLightStatus: false,
            bedroomLightStatus: false,
            doorStatus: true,
            temp: 25,
            user: userId
        })
        profile.roomKey = roomRef.key
        userRef.child(userId).update(profile)
        await client.pushMessage(userId, { type: "text", text: "The door is unlocked" })
    } else {
        var roomKey = await userSnapshot.val().roomKey
        db.ref('rooms').child(roomKey).update({
            doorStatus: true
        })
        await client.pushMessage(userId, { type: "text", text: "The door is unlocked" })
    }
    return "done"
}

async function handleNavigation(menu, userId) {
    var roomKey = await getRoomKeyByUserId(userId)
    switch (menu) {
        case 'MAIN':
            return client.linkRichMenuToUser(userId, config.mainMenuId)
        case 'ROOM_CONTROLLER':
            return client.linkRichMenuToUser(userId, config.roomControllerMenuId)
        case 'LIGHT_CONTROLLER':
            await sendStatusMessage(menu, roomKey)
            return client.linkRichMenuToUser(userId, config.lightControllerMenuId)
        case 'AIR_CONTROLLER':
            await sendStatusMessage(menu, roomKey)
            return client.linkRichMenuToUser(userId, config.airControllerMenuId)
        default:
            return client.linkRichMenuToUser(userId, config.mainMenuId)
    }
}

exports.richMenuList = functions.https.onRequest((req, res) => {
    client.getRichMenuList()
        .then((result) => res.send(result))
        .catch((err) => {
            console.error(err)
            res.status(404).end()
        })
})

exports.unlockSuccess = functions.database.ref('rooms/{roomKey}/doorStatus').onUpdate(async (change, context) => {
    console.log("Triggered")
    if (change.before.exists()) {
        return null;
    }
    // Exit when the data is deleted.
    if (!change.after.exists()) {
        return null;
    }
    const doorStatus = change.after.val();
    const roomKey = context.params.roomKey
    var dataSnapshot = await db.ref('room').child(roomKey).once("value")
    const userId = dataSnapshot.val().userId
    console.log("UserId: " + userId)
    console.log("DoorStatus: " + doorStatus)
    console.log("RoomKey: " + roomKey)

    await client.pushMessage(userId, { type: "text", text: `Door Status: Hello World` })
    return Promise.resolve("Done")
})