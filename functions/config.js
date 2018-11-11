const functions = require('firebase-functions')

const config = {
    channelAccessToken: functions.config().line.channel_access_token,
    channelSecret: functions.config().line.channel_secret,
    channelId: functions.config().line.channel_id,
}

module.exports = config

