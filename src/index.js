const path = require('path')
const { CommandoClient } = require('discord.js-commando')
const { set_presence, change_bot_name } = require('./appearance')

if (!process.env.TOKEN) {
  // Set env vars
  require('dotenv').config({ path: path.join(__dirname, '..', 'config', '.env') })
}
// Connect to database
require('./db.js')

const client = new CommandoClient({
  commandPrefix: '/',
  owner: process.env.owner,
  invite: process.env.invite
})

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['server appearance', 'Commands for managing the appearance of the server'],
    ['games', 'Command group game stacks'],
    ['util', 'Command group for utils'],
    ['news', 'Command group for news']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    // prop `help` true be default btw
    help: true,
    unknownCommand: false,
    commandState: false,
    prefix: false,
    eval: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'))

client.on('ready', async () => {
  set_presence(client, 'don\'t click...', 'idle')
  console.log('[BOT] Ready')
})

client.on('guildCreate', () => {
  change_bot_name(client, `Verify ${client.guilds.cache.size}/75`)
})

client.on('error', e => console.log('[ERROR]', e))
client.login(process.env.TOKEN)
