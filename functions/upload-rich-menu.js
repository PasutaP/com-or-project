const config = require('./config.js')
const line = require('@line/bot-sdk')
const richMenu = require('./rich-menu/rich-menu.js')
const fs = require('fs')

const client = new line.Client(config)

let manager = Promise.resolve()

// manager = client.getRichMenuList().then(menu => {
//     console.log(menu)
// })

// manager.then(() => client.createRichMenu(
//     richMenu.airControllerMenu
// )).then((richMenuId) => {
//    console.log(`richMenuId: ${richMenuId}`)
//    return client.setRichMenuImage(richMenuId, fs.createReadStream('./rich-menu/menu-pics/rich-menu/air-controller.png'))
// }).catch(err => {
//     console.err(err)
// }) 

// client.setDefaultRichMenu(config.mainMenuId)
//     .catch(err => console.error(err))

var room = {}

console.log(room[0])


