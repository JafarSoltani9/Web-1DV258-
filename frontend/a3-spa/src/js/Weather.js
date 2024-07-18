import { makeDraggable } from './Window.js'
export default class Weather {
  static windowCount = 0
  static zIndex = 100
  constructor (windowContainer, apiKey) {
    this.windowContainer = windowContainer
    this.apiKey = apiKey

    this.windowElement = this.createWindow()
  }

  createWindow () {
    const windowElement = document.createElement('div')
    windowElement.className = 'custom-window'
    windowElement.style.right = 10 * Weather.windowCount + 'px'
    windowElement.style.top = 10 * Weather.windowCount + 'px'
    windowElement.style.zIndex = Weather.zIndex++
    windowElement.innerHTML = `
            <div class="window-header">
                <span class="window-title">Weather</span>
                <button class="close-button">×</button>
            </div>
            <div class="window-content">
                <div class="search">
                    <input type="text" placeholder="Enter city name" spellcheck="false">
                    <button class="input-btn">Search</button>
                </div>
                <div class="weather-info">
                    <h1 class="city"></h1>
                    <h2 class="temp"></h2>
                    <p class="humidity"></p>
                    <p class="wind"></p>
                </div>
            </div>`

    this.windowContainer.appendChild(windowElement)

    // Event listeners
    const searchButton = windowElement.querySelector('.input-btn')
    const inputField = windowElement.querySelector('.search input')
    searchButton.addEventListener('click', () => {
      const city = inputField.value.trim()
      if (city) {
        this.fetchWeather(city)
      }
    })

    const closeButton = windowElement.querySelector('.close-button')
    closeButton.addEventListener('click', () => {
      this.closeWindow()
    })
    Weather.windowCount++
    makeDraggable(windowElement)

    return windowElement
  }

  async fetchWeather (city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${this.apiKey}`

    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error('Error fetching data: ' + response.statusText)
      }
      const data = await response.json()

      this.windowElement.querySelector('.city').textContent = data.name
      this.windowElement.querySelector('.temp').textContent =
        Math.round(data.main.temp) + '°C'
      this.windowElement.querySelector('.humidity').textContent =
        data.main.humidity + '%'
      this.windowElement.querySelector('.wind').textContent =
        data.wind.speed + ' Km/h'
    } catch (error) {
      console.error('There was an error:', error)
    }
  }

  closeWindow () {
    this.windowContainer.removeChild(this.windowElement)
  }
}
