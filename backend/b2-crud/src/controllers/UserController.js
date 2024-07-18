const Joi = require('joi')
const bcrypt = require('bcrypt')
const User = require('../models/UserModel')
// const session = require('express-session')

const createUser = async (req, res, next) => {
  const schema = Joi.object({
    firstname: Joi.string().required().max(50),
    lastname: Joi.string().required().max(50),
    username: Joi.string().required().max(30),
    email: Joi.string().required().email().max(100),
    password: Joi.string().required().min(8).max(20)
  })

  // validate the request body against the schema
  const { error, value } = schema.validate(req.body, { abortEarly: false })

  // if there's a validation error, respond with a 400 bad request.
  if (error) {
    console.log('Error in Validation', error)
    // use the field name as a string without quotes
    const validationErrors = error.details.reduce((acc, { path, message }) => {
      const fieldName = path.join('.')
      acc[fieldName] = message
      return acc
    }, {}) || {}
    return res.status(400).render('register', { validationErrors, success: undefined, fail: undefined, session: { username: req.session.username } })
  }

  try {
    // if validation passes, extract user data and call the register method
    const { firstname, lastname, username, email, password } = value
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword
    })

    await newUser.save()
    res.status(201).render('register', { fail: undefined, success: 'New user registered successfully!', validationErrors: undefined, session: { username: req.session.username } })
  } catch (error) {
    next(error)

    if (error.code === 11000 && error.keyPattern && error.keyValue) {
      return res.status(400).render('register', { fail: undefined, success: undefined, validationErrors: { username: `Username '${error.keyValue.username}' is already taken.` } })
    }
    return res.status(500).render('register', { fail: 'Failed to register new user!', success: undefined, validationErrors: undefined })
  }
}

const viewLoginPage = async (req, res, next) => {
  if (req.session.username && req.session.username !== undefined) {
    return res.redirect('/snippets')
  } else {
    res.render('login', { session: req.session, fail: undefined, validationErrors: undefined })
  }
}

const viewRegisterPage = async (req, res, next) => {
  if (req.session.username && req.session.username !== undefined) {
    return res.redirect('/snippets')
  } else {
    res.render('register', { validationErrors: undefined, success: undefined, fail: undefined, session: req.session })
  }
}

const logout = async (req, res, next) => {
  if (req.session.username && req.session.username !== undefined) {
    req.session.username = undefined
  }
  // redirect to the home page after logging out
  req.session.save(() => {
    res.redirect('/user/login')
  })
}

const checkAuth = async (req, res, next) => {
  // define the validation schema
  const schema = Joi.object({
    username: Joi.string().required().messages({
      'any.required': 'Username is required.',
      'string.empty': 'Username cannot be empty.'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Username is required.',
      'string.empty': 'Password cannot be empty.'
    })
  })

  // validate the request body aginst the schema
  const { error, value } = schema.validate(req.body, { abortEarly: false })

  // if there's validation error, respond with a 400 bad request
  if (error) {
    const validationErrors = error.details.reduce((acc, { context, message }) => {
      acc[context.key] = message
      return acc
    }, {})
    return res.status(400).render('login', { fail: undefined, validationErrors })
  }
  // Rest of your authentication logic...

  // If validation passes, extract user data and call the login method
  const { username, password } = value

  // Assuming you have a User model and you're storing hashed passwords
  const user = await User.findOne({ username })

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.username = user.username
    res.redirect('/snippets')
  } else {
    res.status(400).render('login', { fail: 'Invalid username or password!', validationErrors: undefined })
  }
}

module.exports = { createUser, viewLoginPage, viewRegisterPage, logout, checkAuth }
