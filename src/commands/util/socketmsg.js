const { Command } = require('discord.js-commando')
const Socket = require('../../../lib/socket.js')
const { networkInterfaces } = require('os')
const EventEmitter = require('events')

let CONN;

class MsgSocket extends Command {
  constructor(client) {
    super(client, {
      name: 'socket',
      group: 'util',
      memberName: 'socket',
      description: 'Connect to socket server of the bot/',
      hidden: true,
      ownerOnly: true,
      args: [
        {
          key: 'action',
          type: 'string',
          prompt: 'start/stop?',
          oneOf: ['start', 'stop']
        }
      ]
    })
  } 

  run(msg, { action }) { 
    try {
      if (msg.channel.type !== 'dm') return
      if (action == 'stop') {
        return msg.channel.send(((CONN && CONN.stop()).error) || 'Connection closed.')
      }

      // Get ip address of the current machine
      const ip = networkInterfaces()['en0'].find(n => n.family === 'IPv4')['address']
      // Create new websocket connection
      CONN = new Socket(new EventEmitter())
      // Get info about bot channels and guilds
      const guild_info = Array.from(msg.client.channels.cache.entries())
        .filter(([id, ch]) => ch.type == 'text')
        .map(([id, ch]) => {
          return [
            id, 
            { 
              id: ch.id,
              name: ch.name,
              guild: {
                id: ch.guild.id,
                name: ch.guild.name,
                region: ch.guild.region,
                ownerID: ch.guild.ownerID
              } 
            }
          ]
        })

      CONN.connect();
      // Send info to client
      CONN.on('new_conn', () => CONN.events.emit('bot_internal_msg', guild_info))

      CONN.on('error', (e) => msg.channel.send(e.error))
      // console.log(ip, CONN.port)
      CONN.on('msg', (obj) => {
        console.log(1, obj)
        if (!obj.channel) {
          return msg.channel.send(obj.msg)
        }
        return msg.client.channels.cache.get(obj.channel.id).send(obj.msg)
      })
  
      return msg.channel.send(`Connection open \`ws://${'127.0.0.1'}:${CONN.port}\``)
    } catch (error) {
      console.log(error)
      msg.reply('error')
    }
  }
}

function sendTo(msg, chid) {

}

module.exports = MsgSocket