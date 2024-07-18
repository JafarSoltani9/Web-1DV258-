import express from 'express'
import * as issueController from '../controller/issuesController.js'

const router = express.Router()
router.get('/', issueController.home)
router.get('/b3-production', issueController.home)
router.get('/b3-production/projects', issueController.showProjects)
router.post('/b3-production/webhook', issueController.webhook)

// Using ES module export syntax
export default router
