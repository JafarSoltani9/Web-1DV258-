import Weather from './Weather.js'
import MemoryGame from './MemoryGame.js'
import Chat from './Chat.js'

document.addEventListener('DOMContentLoaded', function () {
  const windowContainer = document.getElementById('window-container')

  const memoryGameBtn = document.getElementById('memory-btn')
  memoryGameBtn.addEventListener('click', function () {
    // eslint-disable-next-line no-new
    new MemoryGame(windowContainer)
  })

  const chatBtn = document.getElementById('chat-btn')
  chatBtn.addEventListener('click', function () {
    const websocketUrl = 'wss://courselab.lnu.se/message-app/socket'
    // eslint-disable-next-line no-new
    new Chat(windowContainer, websocketUrl)
  })

  const weatherBtn = document.getElementById('weather-btn')
  weatherBtn.addEventListener('click', function () {
    const apiKey = 'e89f05f16b99ef1fe3530f3e28ce1263'
    // eslint-disable-next-line no-new
    new Weather(windowContainer, apiKey)
  })
})
