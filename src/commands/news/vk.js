const fetch = require('node-fetch')
const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const ACCESS_TOKEN= process.env.access_token

// How get owner id? - https://qna.habr.com/q/274430

class VKNews extends Command {
  constructor(client) {
    super(client, {
      name: 'umoreska',
      aliases: ['u'],
      group: 'news',
      memberName: 'games',
      description: 'Commad for create csgo stack.',
    })
  } 

  async run(msg) { 
    await send_post(msg, await post_by_id("-92876084_355038"))
    await send_post(msg, await post_by_id("-92876084_355029"))
    await send_post(msg, await post_by_id("-92876084_354903"))
    let post = await last_post()

    if (!post) {
      return msg.reply('vk post not found :(')
    } 
    
    return send_post(msg, post) 
  }

  onError(e) {
    console.log(e)
  }
}

async function send_post(msg, post) {
  if (post.isImage) {
    return msg.channel.send(toImage(post.date, post.url))
  }
  let count_chunks = Math.ceil(post.text.length/1024)
  for (let i = 1; i <= count_chunks; i++) {
    let to = 1024*i
    let from = to-1024
    await msg.channel.send(toMsg(post.text.slice(from, to), post.date, i==1 ? post.image : false))
  } 
}

async function last_post(count=1, owner_id=-92876084) {
  const post = await fetch(`http://api.vk.com/method/wall.get?owner_id=${owner_id}&count=${count}&access_token=${ACCESS_TOKEN}&v=5.130`)
  .then(res => res.json())
  .then(({ response }) => Array.isArray(response) ? response[0] : response)
  .then(post => {
    let info = { text: post.text, date: post.date, image: [] }
    if (post.attachments) {
      for (let image of post.attachments.filter(a => a.type === 'photo')) {
        info.image.push(image.photo.sizes.pop().url)
      }
    }
    return info
  })
   
  // if post is empty it's mean that post is photo
  if (post.text === '' || !post.text) {
    return await fetch(`https://api.vk.com/method/photos.get?album_id=wall&rev=1&owner_id=${owner_id}&count=${count}&access_token=${ACCESS_TOKEN}&v=5.130`)
    .then(res => res.json())
    .then(({ response }) => response.items)
    .then(images => {
      let info = { isImage: true, date: images[0].date, url: [] }
      for (let image of images) {
        info.url.push(image.sizes.pop().url)
      }
      return info
    })
  }
  return post
}

async function post_by_id(id='-92876084_354903', owner_id=-92876084) {
  const post = await fetch(`http://api.vk.com/method/wall.getById?owner_id=${owner_id}&access_token=${ACCESS_TOKEN}&v=5.130&posts=${id}`)
    .then(res => res.json())
    .then(({ response }) => Array.isArray(response) ? response[0] : response)
    .then(post => {
      let info = { text: post.text, date: post.date, image: [] }
      if (post.attachments) {
        for (let image of post.attachments.filter(a => a.type === 'photo')) {
          info.image.push(image.photo.sizes.pop().url)
        }
      }
      return info
    })

  // if post is empty it's mean that post if photo
  if (post.text === '' || !post.text) {
    return await fetch(`https://api.vk.com/method/photos.get?album_id=wall&rev=1&owner_id=${owner_id}&count=${count}&access_token=${ACCESS_TOKEN}&v=5.130`)
      .then(res => res.json())
      .then(({ response }) => response.items)
      .then(images => {
        let info = { isImage: true, date: images[0].date, url: [] }
        for (let image of images) {
          info.url.push(image.sizes.pop().url)
        }
        return info
      })
  }
  return post
}

function toMsg(text, time, image=false) {
  let msg = new MessageEmbed()
    .addField(new Date(time).toLocaleTimeString("en-US"), text)
  if (image) {
    for (let i of image) {
      msg.setImage(i)
    }
  }
  return msg
}

function toImage(time, image) {
  let msg = new MessageEmbed()
    .addField(new Date(time).toLocaleTimeString("en-US"), 'No caption')
  for (let i of image) {
    msg.setImage(i)
  }
  return msg
}

module.exports = VKNews
