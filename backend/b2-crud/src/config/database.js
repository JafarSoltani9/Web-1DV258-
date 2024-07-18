require('dotenv').config()
const mongoose = require('mongoose')

// Connect to MongoDB
mongoose.connect('mongodb+srv://b2-crud:Lnu_12345@cluster0.ohqfm62.mongodb.net/?retryWrites=true&w=majority')

// Get the default connection
const db = mongoose.connection

// Bind connection to error event
db.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

db.once('open', () => {
  console.log('Connected to MongoDB')
})

module.exports = mongoose
