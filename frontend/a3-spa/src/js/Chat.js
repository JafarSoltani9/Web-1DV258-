import { makeDraggable } from './Window.js'

export default class Chat {
  static windowCount = 0
  constructor (windowContainer, webSocket) {
    this.windowContainer = windowContainer
    this.webSocket = webSocket
    this.windowElement = this.createChatWindow()
    this.username = this.promptUsername()
    this.initWebSocket(webSocket)
  }

  createChatWindow () {
    const windowElement = document.createElement('div')
    windowElement.className = 'custom-window'

    const centerX = (window.innerWidth - windowElement.offsetWidth) / 2.5
    const centerY = (window.innerHeight - windowElement.offsetHeight) / 40 + 30 * Chat.windowCount

    windowElement.style.left = centerX + 'px'
    windowElement.style.top = centerY + 'px'
    windowElement.innerHTML = `
    <div class="window-header">
        <span class="window-title">Chat application</span>
        <button class="close-button">×</button>
    </div>
    <div class="window-content">
            <div class='chat-div'>
              <div class="chatWindow"></div>
                <div class='chat-controls'>
                    <input class="chat-message" type="text" placeholder="Write your message">
                    <button class="send-btn">Send</button>
                    <button class="clear-btn">Clear chat</button>
                </div>
            </div>
        
    </div>`

    this.windowContainer.appendChild(windowElement)
    // chatDiv.style.display = 'none'
    const sendBtn = document.querySelector('.send-btn')
    const chatMessage = document.querySelector('.chat-message')
    sendBtn.addEventListener('click', () => {
      this.sendMessage(chatMessage.value)
      chatMessage.value = ''
    })

    chatMessage.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        this.sendMessage(chatMessage.value)
        chatMessage.value = ''
      }
    })
    const closeButton = windowElement.querySelector('.close-button')
    closeButton.addEventListener('click', () => {
      this.closeWindow()
    })
    const clearBtn = windowElement.querySelector('.clear-btn')
    clearBtn.addEventListener('click', () => {
      this.clearChat()
    })
    Chat.windowCount++
    makeDraggable(windowElement)
    return windowElement
  }

  initWebSocket (webSocket) {
    this.socket = new WebSocket(webSocket)
    this.socket.onopen = (e) => {
      console.log('[open] Connection established')
    }

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'message') {
        this.displayMessage(data)
      }
    }

    this.socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code}`)
      } else {
        console.error('[close] Connection died')
      }
    }
  }

  displayMessage (msgData) {
    const chatWindow = document.querySelector('.chatWindow')
    if (chatWindow) {
      chatWindow.innerHTML += `<div><b>${msgData.username}:</b> ${msgData.data}</div>`
      chatWindow.scrollTop = chatWindow.scrollHeight
    }
  }

  sendMessage (message) {
    if (message) {
      const msg = {
        type: 'message',
        data: message,
        username: this.username,
        key: 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
      }
      this.socket.send(JSON.stringify(msg))
    }
  }

  clearChat () {
    const chatWindow = this.windowElement.querySelector('.chatWindow')
    if (chatWindow) {
      chatWindow.innerHTML = ''
    }
  }

  promptUsername () {
    let username = localStorage.getItem('username')
    while (!username || username.trim() === '') {
      username = prompt('Please enter your username:')
      if (username === null) {
        break
      }
    }
    if (username && username.trim() !== '') {
      localStorage.setItem('username', username)
    }
    return username
  }

  closeWindow () {
    this.windowContainer.removeChild(this.windowElement)
  }
}
