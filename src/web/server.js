const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '..', 'config', '.env') })
const express = require('express')
const cors = require('cors')
const app = express()
const fetch = require('node-fetch')
// Enable cors
app.use(cors())

const log = (...info) => console.log('[Server]', ...info)
const ci = process.env.client_id
const cs = process.env.client_secret
const ru = 'https://chu1.herokuapp.com/verify'

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/r', (req, res) => {
  res.redirect(`https://oauth.vk.com/authorize?client_id=${ci}&redirect_uri=${ru}&scope=offline`)
})

app.get('/verify', (req, res) => {
  console.log('query', req.query.code)
  const code = req.query.code
  fetch(`https://oauth.vk.com/access_token?client_id=${ci}&client_secret=${cs}&redirect_uri=${ru}&code=${code}`)
    .then(res => res.json())
    .then(console.log)
    .error(console.error) 
  res.sendStatus(200)
})

app.use((req, res, next) => res.status(404).send('<h1>Page not found :(<h1>'))

app.listen(process.env.PORT || 8080, (err) => {
  if (err) return console.error(err);
  console.log(`[Server] Web server ready. ${process.env.PORT || 8080}`)
})

