// DO NOT FOLLOW LINK!!
const STREAM_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstleyVEVO'

/**
 * Set activity status bot.
 * @param {Client} client 
 * @param {String|Number} status 
 */
function set_status(client, status) {
  client.user.setStatus(status)
    .then(console.log, console.error)
}

/**
 * Change bot name (global name)
 * @param {String} name 
 */
function change_bot_name(client, name) {
  client.user.setUsername(name)
    .then(user => console.log(`[BOT] New username is ${user.username}.`))
    .catch(console.error);
}

/**
 * Set activity status and text status bot.
 * @param {Client} client 
 * @param {String} text_status 
 * @param {String|Number} status 
 */
function set_presence(client, text_status, status) {
  client.user.setPresence({ activity: { name: text_status, type: 'STREAMING', url: STREAM_URL }, status })
    .then(ClientPresence => console.log('[BOT]', 'Presence set.'))
    .catch(e => console.log('[ERROR] Error while set presence', e))
}

module.exports = {
  set_status,
  change_bot_name,
  set_presence
}
