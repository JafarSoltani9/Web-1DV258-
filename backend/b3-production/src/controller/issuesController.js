// Import fetchIssues using ES module syntax
import { fetchIssues } from '../model/issuesModel.js'
import { io } from '../../index.js'

export const showProjects = async (req, res) => {
  try {
    const projectId = process.env.GITID
    const issues = await fetchIssues(projectId)
    res.render('projects', { issues })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error fetching issues')
  }
}

export const webhook = (req, res) => {
  console.log('Webhook received', req.body)

  const issue = {
    id: req.body.object_attributes.id, // Ensure this line exists
    title: req.body.object_attributes.title,
    description: req.body.object_attributes.description,
    state: req.body.object_attributes.state,
    author: {
      name: req.body.user.name
    },
    updated_at: req.body.object_attributes.updated_at
  }
  

  io.emit('issue', issue)

  res.status(200).send('Webhook received')
}

export const home = async (req, res) => {
  res.render('home', { messages: ['Welcome to my application!', 'Check out my projects.'] })
}
