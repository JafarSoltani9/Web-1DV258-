const express = require('express')
const session = require('express-session')
const path = require('path')
const fs = require('fs')

const app = express()

app.use(session({
  secret: 'KjFJKEHfgdeklmdhcfytfyidtvy',
  resave: false,
  saveUninitialized: true
}))

// set th the directory
app.set('views', path.join(__dirname, '/src/views'))

// set static files from public
app.use(express.static(path.join(__dirname, '/src/public')))

// set view engine to ejs
app.set('view engine', 'ejs')

// enable encoded from data
app.use(express.urlencoded({ extended: true }))

// enable JSON parsing
app.use(express.json({ extended: true }))

// import routes
const snippetRoutes = require('./src/router/snippetRouter')
const userRoutes = require('./src/router/userRouter')

app.use('/snippets', snippetRoutes)
app.use('/user', userRoutes)
app.get('/', (req, res, next) => {
  res.render('index', { session: { username: req.session.username } })
})

app.use((req, res, next) => {
  res.status(404).render('404', { session: { username: req.session.username } })
})

const logFileStream = fs.createWriteStream('./src/logs/app.log', { flags: 'a' })
app.use((err, req, res, next) => {
  console.log(err.stack)
  console.log(err.name)
  console.log(err.code)

  const date = new Date()

  logFileStream.write(`----------------------------------${date}---------------------------------- \n`)
  logFileStream.write(`Error stack: ${err.stack}\n`)
  logFileStream.write(`Error name: ${err.name}\n`)
  logFileStream.write(`Error code: ${err.code}\n`)

  logFileStream.end()
  res.status(500).json({
    message: '500: server Error!'
  })
  next()
})

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on  port ${process.env.PORT}.`)
})
