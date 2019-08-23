import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import express from 'express'
import { Server } from 'http'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import favicon from 'serve-favicon'
import socket from 'socket.io'

import getSignedS3Url from './utils/getSignedS3Url'
import serveApp from './utils/serveApp'

dotenv.config()

/*
 * Initialize Application
 */
const app = express()
const http = Server(app)
const io = socket(http)

const voters = []
const votes = {}
let viewers = 0

function update () {
  io.emit('update', { votes, viewers })
}

io.on('connection', (socket) => {
  viewers += 1
  update()

  socket.on('disconnect', () => {
    viewers -= 1
    update()
  })

  socket.on('vote', (type) => {
    var address = socket.handshake.address
    console.log('New connection from ' + address.address + ':' + address.port)
    const ip = `${address.address}:${address.port}`
    if (type && !voters.includes(ip)) {
      if (!votes[type]) {
        votes[type] = 0
      }
      votes[type] += 1
      voters.push(ip)
    }
    update()
  })
})

app.set('port', process.env.PORT || 3000)
http.listen(app.get('port'), () => console.log(`Serving from http://0.0.0.0:${app.get('port')}`))

/* Serve Static Content */
app.use(favicon(path.join(__dirname, './public', 'favicon.ico')))
app.use(express.static(path.join(__dirname, './public')))

/* Logging Middleware */
app.use(morgan('dev'))

/* Security Middleware */
app.use(helmet())

/* Parsing Middleware */
app.use(bodyParser.json())
app.use(cookieParser())

app.get('/sign-s3', getSignedS3Url)
app.get('*', serveApp)

export default app
