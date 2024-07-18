const mongoose = require('../config/database')

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      max: 50
    },
    lastname: {
      type: String,
      required: true,
      max: 50
    },
    username: {
      type: String,
      required: true,
      unique: true,
      max: 30
    },
    email: {
      type: String,
      required: true,
      max: 100
    },
    password: {
      type: String,
      required: true,
      min: 8,
      max: 20
    }
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

module.exports = User
