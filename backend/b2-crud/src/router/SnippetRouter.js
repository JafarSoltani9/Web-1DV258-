const router = require('express').Router()

const { createSnippet, deleteSnippet, getAllSnippets, viewSnippetEditPage, viewSnippetCreatePage, updateSnippet, rateSnippet } = require('../controllers/SnippetController')

router.get('/', getAllSnippets)
router.get('/create', viewSnippetCreatePage)
router.get('/edit/:id', viewSnippetEditPage)
router.post('/', deleteSnippet)
router.post('/rate', rateSnippet)
router.post('/update', updateSnippet)
router.post('/create', createSnippet)

module.exports = router
