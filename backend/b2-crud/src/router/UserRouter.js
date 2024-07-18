const router = require('express').Router()
const {
  createUser,
  checkAuth,
  viewLoginPage,
  viewRegisterPage,
  logout
} = require('../controllers/UserController')

router.get('/login', viewLoginPage)
router.get('/register', viewRegisterPage)
router.get('/logout', logout)
router.post('/login', checkAuth)
router.post('/register', createUser)

module.exports = router
