const functions = require('firebase-functions')

const config = {
    channelAccessToken: functions.config().line.channel_access_token,
    channelSecret: functions.config().line.channel_secret,
    channelId: functions.config().line.channel_id,
    mainMenuId: functions.config().line.main_menu_id,
    airControllerMenuId: functions.config().line.air_controller_menu_id,
    lightControllerMenuId: functions.config().line.light_controller_menu_id,
    roomControllerMenuId:  functions.config().line.room_controller_menu_id
}

module.exports = config

