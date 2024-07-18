// const session = require('express-session')
const mongoose = require('mongoose')
const Joi = require('joi')
const Snippet = require('../models/SnippetModel')

const getAllSnippets = async (req, res, next) => {
  try {
    const snippets = await Snippet.find()
    res.render('snippets', { snippets, fail: undefined, success: undefined, session: { username: req.session.username } })
  } catch (error) {
    next(error)
    res.status(500).render('snippets', { snippets: undefined, fail: 'Failed to retreive snippets!', success: undefined, session: { username: req.session.username } })
  }
}

const viewSnippetCreatePage = async (req, res, next) => {
  if (req.session.username && req.session.username !== undefined) {
    res.render('create-snippet', { success: undefined, fail: undefined, validationErrors: undefined, session: { username: req.session.username } })
  } else {
    return res.redirect('/user/login')
  }
}

const viewSnippetEditPage = async (req, res, next) => {
  if (!req.session.username || req.session.username === undefined) {
    return res.redirect('/user/login')
  }

  const { id } = req.params
  const snippet = await Snippet.findById(id)

  if (req.session.username !== snippet.created_by) {
    const snippets = await Snippet.find()
    res.status(401).render('snippets', { snippets, fail: 'You are not allowed to edit this snippet!', success: undefined, session: { username: req.session.username } })
  }

  if (!snippet) {
    // If the snippet is not found, render the 404 page for HTML requests
    if (req.accepts('html')) {
      return res.status(404).render('404', { session: { username: req.session.username } })
    }

    // For other types of requests (e.g., JSON), return a JSON response
    return res.status(404).json({ error: 'Snippet not found' })
  }

  res.render('edit-snippet', { snippet, success: undefined, fail: undefined, validationErrors: undefined, session: { username: req.session.username } })
}

const createSnippet = async (req, res, next) => {
  // Ensure that req.session is initialized
  req.session = req.session || {}

  // Convert 'on' to true, leave other values as they are
  req.body.is_private = req.body.is_private === 'on'

  // Define the validation schema
  const schema = Joi.object({
    title: Joi.string().required().max(100),
    language: Joi.string().required().max(50),
    description: Joi.string().required().max(300),
    snippet: Joi.string().required().max(5000),
    is_private: Joi.boolean().optional()
  })

  // Validate the request body against the schema
  const { error, value } = schema.validate(req.body, { abortEarly: false })

  // If there's a validation error, respond with a 400 Bad Request
  if (error) {
    const validationErrors = error.details.reduce((acc, { path, message }) => {
      // Use the field name as a string without quotes
      const fieldName = path.join('.')

      acc[fieldName] = message
      return acc
    }, {}) || {}

    return res.status(400).render('create-snippet', { validationErrors, session: { username: req.session.username } })
  }

  try {
    const username = req.session.username

    const newSnippet = new Snippet({
      title: value.title,
      language: value.language,
      description: value.description,
      snippet: value.snippet,
      rating: value.rating,
      is_private: value.is_private,
      created_by: username
    })

    await newSnippet.save()

    res.status(201).render('create-snippet', { fail: undefined, success: 'Snippet created successfully!', validationErrors: undefined, session: { username: req.session.username } })
  } catch (error) {
    next(error)

    res.status(400).render('create-snippet', { success: undefined, fail: 'Failed to create snippet!', validationErrors: undefined, session: { username: req.session.username } })
  }
}

const updateSnippet = async (req, res, next) => {
  // Ensure that req.session is initialized
  req.session = req.session || {}

  const snippet = await Snippet.findById(req.body._id)

  if (req.session.username !== snippet.created_by) {
    const snippets = await Snippet.find()
    res.status(401).render('snippets', { snippets, fail: 'You are not allowed to update this snippet!', success: undefined, session: { username: req.session.username } })
  }

  // Convert 'on' to true, leave other values as they are
  req.body.is_private = req.body.is_private === 'on'

  // Define the validation schema
  const schema = Joi.object({
    title: Joi.string().required().max(100),
    language: Joi.string().required().max(50),
    description: Joi.string().required().max(300),
    snippet: Joi.string().required().max(5000),
    is_private: Joi.boolean().optional(),
    _id: Joi.string().required()
  })

  // Validate the request body against the schema
  const { error, value } = schema.validate(req.body, { abortEarly: false })

  // If there's a validation error, respond with a 400 Bad Request
  if (error) {
    const validationErrors = error.details.reduce((acc, { path, message }) => {
      // Use the field name as a string without quotes
      const fieldName = path.join('.')

      acc[fieldName] = message
      return acc
    }, {}) || {}

    return res
      .status(400)
      .render('edit-snippet', {
        snippet,
        validationErrors,
        session: { username: req.session.username }
      })
  }

  try {
    const { title, language, description, snippet, isPrivate, _id } =
          value

    const username = req.session.username

    // Find the existing snippet by _id and update its fields
    await Snippet.updateOne(
      { _id, created_by: username },
      {
        $set: {
          title,
          language,
          description,
          snippet,
          isPrivate
        }
      }
    )

    res.status(201).render('edit-snippet', {
      snippet,
      fail: undefined,
      success: 'Snippet updated successfully!',
      validationErrors: undefined,
      session: { username: req.session.username }
    })
  } catch (error) {
    next(error)

    res.status(400).render('edit-snippet', {
      snippet,
      success: undefined,
      fail: 'Failed to update snippet!',
      validationErrors: undefined,
      session: { username: req.session.username }
    })
  }
}

const rateSnippet = async (req, res, next) => {
  const snippet = await Snippet.findById(req.body._id)

  if (!snippet) {
    return res.status(404).json({ success: false })
  }

  try {
    const rateToAdd = parseInt(req.body.rate, 10) || 0 // Ensure it's a valid integer
    const newRate = Math.round((snippet.rating + rateToAdd) / (snippet.rate_count + 1))

    await Snippet.updateOne(
      { _id: req.body._id },
      {
        $set: {
          rating: newRate,
          rate_count: snippet.rate_count + 1
        }
      }
    )

    const updatedSnippet = await Snippet.findById(req.body._id)

    return res.status(200).json({ success: true, totalRate: updatedSnippet.rating, totalRateCount: updatedSnippet.rate_count })
  } catch (error) {
    next(error)

    return res.status(500).json({ success: false })
  }
}

const deleteSnippet = async (req, res, next) => {
  try {
    // Ensure that req.session is initialized
    req.session = req.session || {}

    // Check for a valid _id before attempting deletion
    if (!req.body._id || !mongoose.Types.ObjectId.isValid(req.body._id)) {
      return res.status(400).render('snippets', { success: undefined, fail: 'Invalid snippet id provided for deletion.', session: { username: req.session.username } })
    }

    // Find the existing snippet by _id and delete the document
    const result = await Snippet.deleteOne({ _id: req.body._id, created_by: req.session.username })

    const snippets = await Snippet.find()

    if (result.deletedCount === 1) {
      // The snippet was successfully deleted
      return res.status(200).render('snippets', { snippets, fail: undefined, success: 'Snippet deleted successfully!', session: { username: req.session.username } })
    } else {
      // No snippet was deleted, possibly because it didn't exist
      return res.status(200).render('snippets', { snippets, success: undefined, fail: 'Snippet not found for deletion.', session: { username: req.session.username } })
    }
  } catch (error) {
    next(error)

    return res.status(500).render('snippets', { success: undefined, fail: 'Failed to delete snippet!', session: { username: req.session.username } })
  }
}

module.exports = { createSnippet, rateSnippet, getAllSnippets, viewSnippetCreatePage, viewSnippetEditPage, updateSnippet, deleteSnippet }
