import URLFetcher from './urlFetcher.mjs'
import DataScraper from './dataScraper.mjs'

const urlFetcher = new URLFetcher()
const dataScraper = new DataScraper(urlFetcher)
const startUrl = process.argv[2]

/**
 *
 */
async function scrapingFunction () {
  try {
    const data = await dataScraper.scraping(startUrl)
    dataScraper.searchingReservation(data)
  } catch (error) {
    console.error('Error during scraping and finding reservations: ', error)
  }
}

scrapingFunction()
