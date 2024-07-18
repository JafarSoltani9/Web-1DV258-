import { parse as parser } from 'node-html-parser'
class urlFetcher {
  async fetchUrl (url) {
    const res = await fetch(url)
    const content = res.text()
    return content
  }

  async fetchParse (url, cookie) {
    const request = await fetch(url, {
      headers: {
        Cookie: cookie
      }
    })
    const text = await request.text()
    return text
  }

  async loginFunction (url) {
    const username = 'zeke'
    const password = 'coys'

    const document = await this.fetchUrl(url)
    const root = parser.parse(document)
    const actionUrl = url + root.querySelector('form').attributes.action.split('./').join('')

    const options = {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `username=${username}&password=${password}&submit=login`
    }

    const res = await fetch(actionUrl, options)
    const link = res.headers.get('location')
    const cookie = res.headers.get('set-cookie')

    return { actionUrl: link, cookie }
  }
}
export default urlFetcher
