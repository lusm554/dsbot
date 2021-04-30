const fetch = require('node-fetch')
const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const { newsEmitter } = require('../../events/news.event')
const NewsDAO = require('../../dao/news.dao')
const ACCESS_TOKEN= process.env.access_token

/**
 * INFO
 * How get owner id? - https://qna.habr.com/q/274430
 * How get group id? - It this is string after `https://vk.com/`
 * URL: https://vk.com/jumoreski group_id: jumoreski
 * 
 * owner_id = '-' + id
 */

class VKNews extends Command {
  constructor(client) {
    super(client, {
      name: 'vk',
      aliases: ['vk_stop'],
      group: 'news',
      memberName: 'games',
      description: 'Receive the latest news from a specific group',
      guildOnly: true,
      clientPermissions: ['ADMINISTRATOR', 'MANAGE_CHANNELS'],
      userPermissions: ['ADMINISTRATOR', 'MANAGE_CHANNELS'],
      args: [
        {
          key: 'action',
          type: 'string',
          oneOf: ['start', 'stop', 'list'],
          prompt: 'Group action?'
        },
        {
          key: 'group_id',
          type: 'string',
          prompt: 'Group id?',
          default: ''
        }
      ]
    })  
  } 

  async run(msg, { action, group_id }) {
    try {
      if (group_id === '' && action != 'list') return msg.reply('Group doesn\'t exist. Try again.');

      if (action === 'list') {
        let groupList = await NewsDAO.getGroupsList({ guild_id: msg.guild.id, channel_id: msg.channel.id })
        if (groupList.length == 0) return msg.channel.send('Groups not found :four: :zero: :four:')
        return msg.channel.send(
          new MessageEmbed()
            .setTitle(`Groups list ${groupList.length}/2`)
            .setDescription(`${groupList.map(({ group_id }) => `https://vk.com/${group_id}`).join('\n')}`)
          )
      }

      const info = await getInfoAboutGroup(group_id)
      if (info.error) return msg.reply('Group doesn\'t exist. Try again.');

      if (action === 'stop') {
        const isOk = await NewsDAO.deleteGroup({ group_id: info.screen_name, channel_id: msg.channel.id })
        if (isOk.error) return msg.channel.send('Error :(');
        return msg.channel.send(`News from ${group_id} stopped.`)
      }
  
      const isCountOfGroupsAllowed = await group_limit(msg.guild.id)
      if (!isCountOfGroupsAllowed) return msg.channel.send('Too many groups (▰˘︹˘▰)\nMore features coming soon.')

      const addGroupStatus = await NewsDAO.addGroup({
        group_id,
        guild_id: msg.guild.id,
        channel_id: msg.channel.id
      })
      const updateLastPostStatus = await NewsDAO.updateLastPost(group_id, { group_id, id: null })
      
      if (addGroupStatus.error || updateLastPostStatus.error) {
        if (String(addGroupStatus.error).startsWith('MongoError: E11000 duplicate key error')) {
          return msg.channel.send(`News from ${`${group_id}`} already set.`)
        }
        return msg.channel.send('Sorry, at the moment i can\'t set group. Try later ')
      }
  
      return msg.channel.send(groupDescription(info))
      // return send_post(msg, await get_last_post('-'+info.id, 1), info)
    } catch (error) {
      console.log(error)
      return msg.channel.send('Error while execute this command :(')
    }
  }

  onError(e) {
    console.log(e)
  }
}

newsEmitter.on('post', async ({ group_id }, channel) => {
  const info = await getInfoAboutGroup(group_id)
  const post = await get_last_post('-'+info.id, 1)

  const last_post_id = await NewsDAO.getLastPost(group_id)
  if (post[0].post_id === last_post_id.group.id) return;

  const updateLastPostStatus = await NewsDAO.updateLastPost(group_id, { group_id, id: post[0].post_id })
  if (updateLastPostStatus.error || last_post_id && last_post_id.error) {
    newsEmitter.emit('error', updateLastPostStatus.error || last_post_id && last_post_id.error)
    return channel.send('Error :(')
  }

  // If post from another group
  if (post.every(p => p.text === '' && !p.isPostHaveAttachments)) return;

  send_post(channel, post, info)
})

async function group_limit(guild_id) {
  const subs = await NewsDAO.getBy({ guild_id }, 'count')
  return subs < 2
}

function groupDescription(info) {
  return new MessageEmbed()
    .addField('INFO ↓', 'Each new group post will be forwarded to this channel.')
    .setTitle(info.name)
    .setDescription(info.description || 'not description')
    .setImage(info.photo_200)
    .setURL(`https://vk.com/${info.screen_name}`)
    .setTimestamp()
}

function getInfoAboutGroup(group_id) {
  return fetch(`http://api.vk.com/method/groups.getById?group_id=${group_id}&fields=site,description,activity&access_token=${ACCESS_TOKEN}&v=5.130`)
    .then(res => res.json())
    .then(json => json.error ? json : json.response[0])
    .catch(e => console.error('[ERROR]', e))
}

const toPostURL = (post, info) => `https://vk.com/${info.screen_name}?w=wall${post.owner_id+'_'+post.post_id}`

async function send_post(channel, posts, info) {
  for (let post of posts) {
    // REWRITE WITH OPPORTUNITY SEND BIG MESSAGES !!!!!!!!!!!!!!!!
    if (post.text.length > 1024) return channel.send(`Temporarily unable to send large messages ʕ•́ᴥ•̀ʔっ. \nSee original ${toPostURL(post, info)}`);

    toMsg(post, info).forEach(async p => await channel.send(p))
  }
  // let count_chunks = Math.ceil(post.text.length/1024)
  // for (let i = 1; i <= count_chunks; i++) {
  //   let to = 1024*i
  //   let from = to-1024
  //   await msg.channel.send(toMsg(post.text.slice(from, to), post.date, i==1 ? post.image : false))
  // } 
}

async function get_last_post(owner_id, count=1) {
  const raw_posts = await fetch(`http://api.vk.com/method/wall.get?owner_id=${owner_id}&count=${count+1}&access_token=${ACCESS_TOKEN}&v=5.130`)
    .then(res => res.json())
    .then(json => { 
      let unpinned = json.response.items.filter(item => item.is_pinned !== 1)
      if (json.response.items.length === unpinned.length) return unpinned.slice(0, unpinned.length-1);
      return unpinned
    })
    .catch(e => console.error('[ERROR]', e))
  const posts = raw_posts
    .map(post => ({ date: post.date, text: post.text, attachments: post.attachments, post_id: post.id, owner_id }))

  return posts.map(post => {
    if (post.attachments === undefined) {
      post.isPostHaveAttachments = false
      return post
    }
    post.text = post.text || 'No caption'
    post.attachments = post.attachments.filter(file => {
      if (file.type !== 'photo') {
        post.isPostAttachmentsHaveNotSupportedType = true
        return false
      } else {
        post.isPostHaveAttachments = true
        return true
      }
    })
    return post
  })
}

function toMsg(post, info) {
  const post_url = toPostURL(post, info)
  const main_msg = new MessageEmbed()
    .setTitle(info.name)
    .addField(new Date(post.date).toLocaleTimeString("en-US"), post.text)
    .setURL(post_url)
  let msgs = [main_msg]

  if (post.isPostHaveAttachments) { // To send several photos in MessageEmbed use -> https://discordjs.guide/popular-topics/webhooks.html#what-is-a-webhook
    if (post.attachments.length > 1) {
      post.attachments.forEach((photo, i) => {
        if (i==0) return msgs[0].setImage(photo.photo.sizes.pop().url);
        msgs.push(
          new MessageEmbed()
            .setTitle(info.name + ` other images ${i+1}/${post.attachments.length}`)
            .addField(new Date(post.date).toLocaleTimeString("en-US"), 'No caption')
            .setURL(post_url)
            .setImage(photo.photo.sizes.pop().url)
        )
      })
    } else {
      msgs[0].setImage(post.attachments[0].photo.sizes.pop().url)
    }
  }
  if (post.isPostAttachmentsHaveNotSupportedType) {
    msgs = msgs.map(msg => msg.setFooter('*The post is not complete, see the original'))
  }
  return msgs
}

module.exports = VKNews
