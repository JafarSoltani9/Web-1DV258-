import { makeDraggable } from './Window.js'
export default class MemoryGame {
  static windowCount = 0
  static zIndex = 100

  constructor (windowContainer) {
    this.windowCount = MemoryGame.windowCount++
    this.zIndex = MemoryGame.zIndex++
    this.selectedCards = []
    this.attempts = 0
    this.images = [
      'img/0.png',
      'img/1.png',
      'img/2.png',
      'img/3.png',
      'img/4.png',
      'img/5.png',
      'img/6.png',
      'img/7.png'
    ]
    this.windowContainer = windowContainer
    this.windowElement = this.createMemoryGameContent()
  }

  createMemoryGameContent () {
    const windowElement = document.createElement('div')
    windowElement.className = 'custom-window'
    windowElement.style.left = 10 * this.windowCount + 'px'
    windowElement.style.top = 10 * this.windowCount + 'px'
    windowElement.style.zIndex = this.zIndex
    windowElement.innerHTML = `
            <div class="window-header">
                <span class="window-title">Memory Game</span>
                <button class="close-button">×</button>
            </div>
            <div class="window-content">
              <button class="reset-btn">Reset Game</button>
              <select id="grid-size-${this.windowCount}" class="game-board">
                <option class="option-btn" value="2x2">2x2</option>
                <option class="option-btn" value="2x4">2x4</option>
                <option class="option-btn" value="4x4">4x4</option>
              </select>
              <div id="game-board-${this.windowCount}" class="game-board"></div>
              <p>Attempts: <span id="attempts-${this.windowCount}">0</span></p>
              
            
        </div>`

    this.windowContainer.appendChild(windowElement)
    const select = windowElement.querySelector(
      `#grid-size-${this.windowCount}`
    )
    select.addEventListener('change', () => {
      this.startGame()
    })
    const resetBtn = windowElement.querySelector('.reset-btn')
    resetBtn.addEventListener('click', () => {
      this.resetGame()
    })
    const closeButton = windowElement.querySelector('.close-button')
    closeButton.addEventListener('click', () => {
      this.closeWindow()
    })
    makeDraggable(windowElement)

    return windowElement
  }

  startGame () {
    this.selectedCards = []
    this.attempts = 0
    document.getElementById(`attempts-${this.windowCount}`).innerText =
      this.attempts
    const gridSize = document.getElementById(
      `grid-size-${this.windowCount}`
    ).value
    const [rows, cols] = gridSize.split('x').map(Number)
    const totalCards = rows * cols
    const gameBoard = document.getElementById(`game-board-${this.windowCount}`)
    gameBoard.className = `game-board size-${gridSize}`
    this.windowSize(gridSize, gameBoard)

    let gameImages = this.images.slice(0, totalCards / 2)
    gameImages = [...gameImages, ...gameImages]
    this.shuffle(gameImages)

    gameBoard.innerHTML = ''
    gameImages.forEach((image, index) => {
      const card = document.createElement('div')
      card.classList.add('card')
      card.tabIndex = 0
      card.dataset.image = image
      card.dataset.index = index
      card.onclick = () => this.revealCard(card)
      card.addEventListener('keydown', this.handleCardKeyPress.bind(this))
      gameBoard.appendChild(card)
    })
  }

  handleCardKeyPress (event) {
    const key = event.key
    const currentCard = event.target

    if (key === 'Enter') {
      this.revealCard(currentCard)
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      this.moveFocus(currentCard, key)
    }
  }

  moveFocus (currentCard, direction) {
    const currentPos = Array.from(currentCard.parentNode.children).indexOf(currentCard)
    const gridSize = document.getElementById(`grid-size-${this.windowCount}`).value.split('x').map(Number)
    const rows = gridSize[0]
    const cols = gridSize[1]
    let newPos = currentPos

    switch (direction) {
      case 'ArrowUp': newPos = Math.max(currentPos - cols, 0); break
      case 'ArrowDown': newPos = Math.min(currentPos + cols, rows * cols - 1); break
      case 'ArrowLeft': newPos = currentPos % cols === 0 ? currentPos : currentPos - 1; break
      case 'ArrowRight': newPos = currentPos % cols === cols - 1 ? currentPos : currentPos + 1; break
    }

    currentCard.parentNode.children[newPos].focus()
  }

  resetGame () {
    this.selectedCards = []
    this.attempts = 0
    document.getElementById(`attempts-${this.windowCount}`).innerText = this.attempts
    this.startGame()
  }

  windowSize (gridSize, gameBoard) {
    switch (gridSize) {
      case '2x2':
        gameBoard.style.width = '200px'
        gameBoard.style.height = '200px'
        this.windowElement.style.width = '400px'
        this.windowElement.style.height = '400px'
        break
      case '2x4':
        gameBoard.style.width = '400px'
        gameBoard.style.height = '200px'
        this.windowElement.style.width = 'auto'
        this.windowElement.style.height = 'auto'
        break
      case '4x4':
        gameBoard.style.width = '400px'
        gameBoard.style.height = '400px'
        this.windowElement.style.width = '450px'
        this.windowElement.style.height = '600px'
        break
    }
  }

  shuffle (array) {
    array.sort(() => Math.random() - 0.5)
  }

  checkMatch () {
    if (this.selectedCards[0].dataset.image === this.selectedCards[1].dataset.image) {
      this.selectedCards.forEach((card) => (card.style.visibility = 'hidden'))
      this.selectedCards = []
      this.checkWin()
      this.moveToNext()
    } else {
      setTimeout(() => {
        this.selectedCards.forEach((card) => {
          card.innerText = ''
          card.classList.remove('revealed')
        })
        this.selectedCards = []
        this.moveToNext()
      }, 1000)
    }
  }

  moveToNext () {
    const cards = Array.from(this.windowElement.querySelectorAll('.card'))
    const visibleCards = cards.filter(card => card.style.visibility !== 'hidden' && card.style.display !== 'none')

    if (visibleCards.length === 0) {
      return
    }

    const focusedIndex = cards.indexOf(document.activeElement)
    let nextCard

    if (focusedIndex === -1 || focusedIndex === cards.length - 1) {
      nextCard = visibleCards[0]
    } else {
      nextCard = visibleCards.find((card, index) => index > focusedIndex)
      if (!nextCard) {
        nextCard = visibleCards[0]
      }
    }

    nextCard.focus()
  }

  revealCard (card) {
    if (this.selectedCards.length < 2 && !card.classList.contains('revealed')) {
      // card.innerText = card.dataset.image
      card.innerHTML = ''
      const img = document.createElement('img')
      img.src = card.dataset.image
      img.style.width = '100%'
      img.style.height = '100%'
      card.appendChild(img)
      card.classList.add('revealed')
      this.selectedCards.push(card)

      if (this.selectedCards.length === 2) {
        this.attempts++
        document.getElementById(`attempts-${this.windowCount}`).innerText = this.attempts
        this.checkMatch()
      }
    }
  }

  checkWin () {
    const allCards = document.querySelectorAll('.card')
    if ([...allCards].every((card) => card.style.visibility === 'hidden')) {
      alert('You won!')
    }
  }

  closeWindow () {
    this.windowContainer.removeChild(this.windowElement)
  }
}
