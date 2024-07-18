import express from 'express'
import expressSession from 'express-session'
import path from 'path'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

import issueRoute from './src/routes/issuesRoute.js'
dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new SocketIOServer(server)

// Session configuration
app.use(expressSession({
  secret: 'KjFJKEHfgdeklmdhcfytfyidtvy', // Fallback secret
  resave: false,
  saveUninitialized: true
}))

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Set the directory for static files correctly
// Serve static files from "/b3-production"
app.use('/b3-production', express.static(path.join(__dirname, 'src', 'public')))


// Correctly set the directory for views
const viewsPath = path.join(__dirname, 'src', 'views')
app.set('views', viewsPath)
app.set('view engine', 'ejs')

// Enable URL-encoded data
app.use(express.urlencoded({ extended: true }))

// Enable JSON parsing
app.use(express.json())

// Use your routing
app.use('/', issueRoute)

// Handle any errors that occur
io.on('connection', (socket) => {
  console.log('A user connected')
})

// Adjusted route for serving the home page, considering the '/b3-production' prefix if needed
//app.get('/', (req, res) => {
 // res.redirect('/b3-production')
//})

app.use((req, res) => {
  res.status(404).render('404')
})


// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`)
})

export { io }
