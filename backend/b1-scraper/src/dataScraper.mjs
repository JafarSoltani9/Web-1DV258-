import URLFetcher from './urlFetcher.mjs'
import { parse as parser } from 'node-html-parser'
class dataScraper {
  constructor () {
    this.fetch = new URLFetcher()
  }

  async scraping (startUrl) {
    // Extract links and names
    const [pageNames, pageLinks] = await this.extract(startUrl)
    console.log('Scraping links... OK')
    // Initialize data object
    const scrapedData = {}
    for (let pageIndex = 0; pageIndex < pageLinks.length; pageIndex++) {
      const lowercaseName = pageNames[pageIndex].toLowerCase()

      switch (lowercaseName) {
        case 'calendar':
          scrapedData.calendar = await this.scrapeCalendarData(
            pageLinks[pageIndex]
          )
          break
        case 'thecinema!':
          scrapedData.movies = await this.scrapeCinema(pageLinks[pageIndex])
          break
        case "zeke'sbar!":
          scrapedData.dinner = await this.restrungScraping(
            pageLinks[pageIndex]
          )
          break
        default:
          console.log('Page not find!')
          break
      }
    }
    return scrapedData
  }

  async scrapeCalendarData (url) {
    const [names, links] = await this.extract(url)
    console.log('Scraping available days... OK')

    // Create an array
    const calendarPromises = links.map((link, index) => {
      const calendarUrl = (url + link).replace('./', '')
      return this.getIndividualCalendar(calendarUrl).then(data => {
        return { name: names[index], data }
      })
    })
    const calendarEntries = await Promise.all(calendarPromises)
    const calendar = calendarEntries.reduce((acc, entry) => {
      acc[entry.name] = entry.data
      return acc
    }, {})

    return calendar
  }

  async extract (url) {
    const content = await this.fetch.fetchUrl(url)
    // create the html content.
    const root = parser.parse(content)
    const querySelect = root.querySelectorAll('a')
    const links = querySelect.map((element) =>
      element.rawAttrs.replace(/href="|"/g, '')
    )
    const names = querySelect.map((element) =>
      element.textContent.replace(/\n| /g, '')
    )
    return [names, links]
  }

  async scrapeCinema (url) {
    const content = await this.fetch.fetchUrl(url)
    console.log('Scraping showtimes... OK')
    const root = parser.parse(content)
    const selects = root.querySelectorAll('select')
    const cinemaData = {}
    const names = {}
    const ids = {}

    for (const select of selects) {
      const options = Array.from(select.querySelectorAll('option')).slice(1)
      const attributeName = select.attributes.name

      names[attributeName] = options.map((element) => element.textContent)
      ids[attributeName] = options.map((element) => element.attributes.value)
    }

    for (let i = 0; i < names.movie.length; i++) {
      for (const j of names.day) {
        const movieTime = await this.showMoviesTime(
          url,
          ids.day[names.day.indexOf(j)],
          ids.movie[i]
        )
        if (!cinemaData[j]) {
          cinemaData[j] = {}
        }
        if (!cinemaData[j][names.movie[i]]) {
          cinemaData[j][names.movie[i]] = movieTime
        }
      }
    }
    // console.log(cinemaData)
    return cinemaData
  }

  async restrungScraping (url) {
    const { actionUrl, cookie } = await this.fetch.loginFunction(url)
    const doc = await this.fetch.fetchParse(url + actionUrl, cookie)
    const root = parser.parse(doc)
    const inputs = root.querySelectorAll('input[type="radio"]')
    const values = Array.from(inputs).map((element) => element.attributes.value)
    const reservation = this.timeForReservation(values)
    console.log('Scraping possible reservations... OK')
    return reservation
  }

  async checkOutCalender (url) {
    // Fetch content
    const content = await this.fetchUrl(url)
    const root = parser.parse(content)
    const table = root.querySelector('table')
    const headers = Array.from(table.querySelectorAll('th')).map(element => element.textContent)
    const columns = Array.from(table.querySelectorAll('td')).map(element => element.textContent)

    const data = {}
    const nonNumber = /[^a-zA-Z0-9]/g

    for (let i = 0; i < headers.length; i++) {
      if (!nonNumber.test(columns[i])) {
        data[headers[i]] = columns[i].toLowerCase()
      }
    }
    return data
  }

  async showMoviesTime (url, day, movie) {
    const response = await fetch(url + '/check?day=' + day + '&movie=' + movie)
    const showtimeData = await response.json()
    const showtimes = []
    for (let i = 0; i < showtimeData.length; i++) {
      if (showtimeData[i].status === 1) {
        showtimes.push(showtimeData[i].time)
      }
    }
    return showtimes
  }

  timeForReservation (days) {
    const data = {}
    const dayMap = { fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

    for (const i of days) {
      const dayKey = i.substring(0, 3)
      const dayName = dayMap[dayKey]

      if (dayName) {
        const startTime = i.substring(3, 5) + ':00'
        const endTime = i.substring(5, 7) + ':00'

        if (!data[dayName]) {
          data[dayName] = []
        }
        data[dayName].push(`${startTime} - ${endTime}`)
      }
    }
    return data
  }

  searchingReservation (data) {
    console.log('\n \nRecommendations')
    console.log('================')
    const availableDays = this.availableDay(data.calendar)

    availableDays.forEach(day => {
      const movies = data.movies[day] || {}
      const dinnerOptions = data.dinner[day] ? Object.values(data.dinner[day]) : []

      // Skip processing if no movies or dinner data is available for the day
      if (Object.keys(movies).length === 0 || dinnerOptions.length === 0) {
        console.log('No reservations found on ' + day)
        return
      }

      const possibleReservations = []

      Object.entries(movies).forEach(([movie, movieTimes]) => {
        movieTimes.forEach(movieTime => {
          const movieHour = parseInt(movieTime.split(':')[0])

          dinnerOptions.forEach(dinnerTime => {
            const dinnerHour = parseInt(dinnerTime.split(':')[0])
            if (dinnerHour - movieHour >= 2) {
              possibleReservations.push({ movie, movieTime, dinnerTime })
            }
          })
        })
      })

      if (possibleReservations.length === 0) {
        console.log('No reservations found on ' + day)
      } else {
        possibleReservations.forEach(({ movie, movieTime, dinnerTime }) => {
          console.log(`* On ${day}, the movie "${movie}" starts at ${movieTime} and there is a free table at ${dinnerTime}`)
        })
      }
    })
  }

  async getIndividualCalendar (url) {
    const htmlContent = await this.fetch.fetchUrl(url)
    const root = parser.parse(htmlContent)
    const table = root.querySelector('table')
    const headers = Array.from(table.querySelectorAll('th')).map(element => element.textContent)
    const columns = Array.from(table.querySelectorAll('td')).map(element => element.textContent)

    const data = {}
    const nonAlphanumericRegex = /[^a-zA-Z0-9]/g

    for (let i = 0; i < headers.length; i++) {
      if (!nonAlphanumericRegex.test(columns[i])) {
        data[headers[i]] = columns[i].toLowerCase()
      }
    }
    return data
  }

  availableDay (calendar) {
    const count = {}
    const days = []

    for (const day in calendar) {
      for (const event in calendar[day]) {
        // Check if the day is already
        count[event] = (count[event] || 0) + 1
      }
    }
    for (const day in count) {
      if (count[day] === 3) {
        days.push(day)
      }
    }
    return days
  }
}
export default dataScraper
