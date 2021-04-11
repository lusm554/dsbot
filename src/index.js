const path = require('path')
// Set env vars
require('dotenv').config({ path: path.join(__dirname, '..', 'config', '.env') })
const { Client, MessageEmbed, ClientUser, User } = require('discord.js')
const client = new Client()
const { set_presence } = require('./bot_appearance')
const PREFIX = '$'

const id_to_mention = user => '<@'+user+'>'

// Commands config.
const cmd_config = {
  cs_stack: {
    args(args) {
      // It's always true 
      return args.length > 0 || args.length == 0
    },
    msg: 'something wrong...'
  },
  timer: {
    args(args) {
      if (args.length === 0) return false
      return true
    },
    msg: 'something wrong...'
  }
}

client.on('ready', async () => {
  set_presence(client, 'oopps..', 'idle')
  console.log('[BOT] Ready')
})

/**
 * Checks if the message exists and meets the requirements. 
 * @param {Message} msg 
 * @returns {Boolean}
 */
function isValid(msg) {
  const [cmd, args] = parse_msg(msg)
  const config = cmd_config[cmd]

  if (!config) {
    msg.channel.send('Cmd or args is required.')
    return false
  }

  for (let [, test] of Object.entries(config)) {
    if (typeof test == 'function' && !test(args)) {
      msg.reply(config.msg)
      return false
    }
  }
  return true
}

/**
 * Get args and command from message.
 * @param {Message} msg – message from client
 * @returns {Array}
 */
function parse_msg(msg) {
  const m = msg.content
  const cmd = m.slice(1, m.indexOf(' ') == -1 ? m.length : m.indexOf(' '))
  const args = m.slice(cmd.length+2)
  return [cmd, args]
}

client.on('message', (msg) => {
  if (msg.content.startsWith(PREFIX) && !isValid(msg) || !msg.content.startsWith(PREFIX)) return;
  const [cmd, args] = parse_msg(msg)

  switch (cmd) {
    case 'timer':
      timer(msg.channel, args)
      break;
    case 'cs_stack':
      set_cs_stack(msg, args)
      break;
  }
})

client.on('messageReactionAdd', async (reaction, user) => {
  await reaction.fetch()
  // Check that this is a bot message and is a reaction from user
  if (user.id == client.user.id || reaction.me) return;
  // check that this is a certain reaction
  if (reaction.emoji.name !== '👍' && reaction.emoji.name !== '👎') return;
  update_cs_stack(reaction)
})

function timer(channel, args) {
  channel.send('timer start')
}

function update_cs_stack(reaction) {
  try {
    let new_mentions = reaction.users.cache
    let {
      title,
      fields: [, default_mentions],
    } = reaction.message.embeds[0]
  
    default_mentions = default_mentions.value.split('\n').filter(u => u !== 'nothing')
    new_mentions = Array.from(new_mentions.keys()).filter(u => u !== client.user.id).map(id_to_mention)
    if ((default_mentions.length + new_mentions.length) > 5) return;
    let current_mentions;
  
    if (reaction.emoji.name === '👍') {
      current_mentions = Array.from(new Set(default_mentions.concat(new_mentions)).keys())
    } else if (reaction.emoji.name === '👎') {
      current_mentions = Array.from(new Set(default_mentions.filter(d => !new_mentions.includes(d))).keys())
    }
    
    const msg = new MessageEmbed()
      .setTitle(title)
      .addField('READY', `${current_mentions.length}/5`)
      .addField('Players:', `${current_mentions.join('\n') || 'nothing'}`)
  
    reaction.message.edit(msg)
      .catch(e => console.log('[ERROR] Error while edit message', e))
      .then(async msg => {
        await msg.reactions.cache.get('👍').remove()
        msg.reactions.removeAll()
          .catch(error => console.error('[ERROR] Failed to clear reactions: ', error))
          .then(msg => {
            msg.react('👍')
            msg.react('👎')
          })
      })
  } catch (error) {
    console.log('[ERROR]', error)
    reaction.message.reply('Error while run this command.')
  }
}

function set_cs_stack(msg_obj, args) {
  try {
    const mentions = Array.from(new Set([...msg_obj.mentions.users.keys(), msg_obj.author.id]), id_to_mention)
    const message = new MessageEmbed()
      .setTitle('CSGO Stack')
      .addField('READY', `${mentions.length}/5`)
      .addField('Players:', `${mentions.join('\n')}`)
  
    msg_obj.channel.send(message)
      .catch((e) => console.log('[ERROR]', e))
      .then(msg => {
        msg.react('👍')
        msg.react('👎')
      })
  } catch (error) {
    message.reply('Error while run this command.')
  }
}

client.login(process.env.TOKEN)
