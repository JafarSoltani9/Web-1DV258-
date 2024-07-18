const mongoose = require('mongoose')
const { Schema } = mongoose

const snippetSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 100
    },
    language: {
      type: String,
      required: true,
      maxLength: 50
    },
    description: {
      type: String,
      required: true,
      maxLength: 300
    },
    snippet: {
      type: String,
      required: true,
      validate: {
        validator: (v) => v.length <= 5000,
        message:
          'Snippet is too long. Maximum allowed length is 5000 characters.'
      }
    },
    rating: {
      type: Number,
      default: 0
    },
    rate_count: {
      type: Number,
      default: 0
    },
    is_private: {
      type: Boolean,
      default: false
    },
    created_by: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const Snippet = mongoose.model('Snippet', snippetSchema)

module.exports = Snippet
