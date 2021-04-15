const path = require('path')
// Set env vars
require('dotenv').config({ path: path.join(__dirname, '..', 'config', '.env') })
const { MessageEmbed, ClientUser, User } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { set_presence, change_bot_name } = require('./appearance')
const PREFIX = '$'

const client = new CommandoClient({
  commandPrefix: '/',
  owner: '257541382627917825',
  invite: 'https://discord.gg/XGBA7g8XZ5'
})

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['test', 'Test command group'],
    ['admin', 'Command group for admin\'s']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    help: true 
  })
  .registerCommandsIn(path.join(__dirname, 'commands'))

client.on('ready', async () => {
  set_presence(client, 'don\'t click...', 'idle')
  let bot_name = +client.user.username.slice(15, 17)
  if (bot_name !== client.guilds.cache.size && (bot_name = `Verify ${client.guilds.cache.size}/75`)) {
    //change_bot_name(client, bot_name)
    console.log('u need uncomment string..')
  }
  console.log('[BOT] Ready')
})

client.on('error', e => console.log('[ERROR]', e))
client.login(process.env.TOKEN)
