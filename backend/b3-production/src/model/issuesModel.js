const baseUrl = 'https://gitlab.lnu.se/api/v4'

export const fetchIssues = async (projectId) => {
  const url = `${baseUrl}/projects/${projectId}/issues`
  const apiToken = process.env.GIT_TOKEN

  try {
    const response = await fetch(url, {
      headers: { 'PRIVATE-TOKEN': apiToken }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching issues:', error)
    throw error
  }
}

export default { fetchIssues }
