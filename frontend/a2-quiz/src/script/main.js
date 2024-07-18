import HighScore from './modules/HighScore.js'

const btn = document.querySelector('.start-btn')
const startDiv = document.querySelector('.info_box')
const input = document.querySelector('.name-input')
const playAgainBtn = document.querySelector('.play-again')
const gameDiv = document.querySelector('.game-container')
const timeContainer = document.querySelector('.time-container')
const record = document.querySelector('.record')
const quizDiv = document.querySelector('.quiz-div')
const submitBtn = document.querySelector('.submit-btn')
const result = document.querySelector('.result')
const userName = document.querySelector('.user-name')
const resetBtn = document.querySelector('.reset-btn')
const startUrl = 'https://courselab.lnu.se/quiz/question/1'
// const startUrl = 'https://courselab.lnu.se/quiz/question/326'

const highScore = new HighScore()

let game = {
  id: 1,
  question: '',
  message: ''
}
let time = 10
let currentTime = time
let totalTime = 0

let interval
let nextURL = ''
let score = 0
record.style.display = 'none'

/**
 *
 */
function startFunction () {
  if (input.value.length > 0) {
    startDiv.style.display = 'none'
    gameDiv.style.display = 'block'
    userName.innerHTML = `User name: ${input.value}`
    getQuestion(startUrl)
  } else {
    alert('Write Name!')
  }
}
btn.addEventListener('click', startFunction)

submitBtn.addEventListener('click', () => {
  let answerValue
  timeContainer.innerHTML = ''
  clearTimeout(interval)
  const answerBox = document.getElementById('answerBox')
  if (answerBox) {
    answerValue = answerBox.value
    console.log(answerValue)
  } else {
    const answerCount = quizDiv.querySelector('.answers')
    const selector = 'input:checked'
    answerValue = (answerCount.querySelector(selector) || {}).value
  }

  postData(nextURL, { answer: answerValue })
})

/**
 * Performs a POST request to the specified URL with the provided data.
 *
 * @param {string} answerUrl - The URL to which the POST request is made.
 * @param {object} body - The data to be sent in the request body. Should be a JSON-serializable object.
 */
async function postData (answerUrl, body = {}) {
  clock()
  score = score + (time - currentTime)
  console.log(score + (time - currentTime))
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
  const res = await fetch(answerUrl, options)
  const data = await res.json()

  if (res.ok && data.nextURL === undefined) {
    timeCounter()
    highScore.victory(score)
  }
  if (!res.ok && data.nextURL === undefined) {
    showGameOver()
  }
  answerUrl = data.nextURL
  getQuestion(answerUrl)
}

/**
 *
 */
function timeCounter () {
  clearInterval(interval)
  totalTime = totalTime + (time - currentTime)
}

/**
 * Fetches questions from the specified URL.
 *
 * @param {string} getUrl - The URL to fetch questions from.
 * @throws {Error} - If the response format is invalid.
 */
function getQuestion (getUrl) {
  fetch(getUrl)
    .then(function (res) {
      const content = res.headers.get('content-Type')
      if (content.includes('application/json')) {
        return res.json()
      }
      throw new Error('Invalid response format!')
    })
    .then(function (myJson) {
      addQuestion(myJson)
    })
}

/**
 *check answer and go to next question if the answer is correct.
 *
 * @param {object} jObject - The URL to fetch questions from.
 */
function addQuestion (jObject) {
  game = jObject
  const output = []
  const answers = []
  nextURL = game.nextURL
  if (game.alternatives) {
    for (document.altIndex in game.alternatives) {
      answers.push(
        `<label>
                                    <input type="radio" name="question${
                                      game.id
                                    }" value="${document.altIndex}">
                                    ${game.alternatives[document.altIndex]}
                                    </label>`
      )
    }
  } else {
    answers.push(
      `<input type="text" id="answerBox" name="question${game.id}" />`
    )
  }
  output.push(
    `<div >
                            <div class ="question"> ${game.question} </div>
                            <div class ="answers"> ${answers.join('')} </div>
                            </div>`
  )
  quizDiv.innerHTML = output.join('')
  clock()
}

/**
 * show the timer.
 */
function clock () {
  clearInterval(interval)
  currentTime = time
  interval = setInterval(() => {
    timeContainer.innerHTML = 'Time: ' + time + ' seconds'
    time--
    if (time < 0) {
      clearInterval(interval)
      gameDiv.style.display = 'none'
      timeContainer.innerHTML = 'Time is up!'

      timeOver()
    }
  }, 1000)
  time = 10
}

/**
 *
 */
function timeOver () {
  alert('Time over!')
  startDiv.style.display = 'none'
  gameDiv.style.display = 'none'
  document.querySelector('.result').innerHTML = 'Game Over'
  document.querySelector('.play-again').style.display = 'block'
}
/**
 *
 */
function showGameOver () {
  alert('Wrong answer!')
  startDiv.style.display = 'none'
  gameDiv.style.display = 'none'
  document.querySelector('.result').innerHTML = 'Game Over'
  document.querySelector('.play-again').style.display = 'block'
}

playAgainBtn.addEventListener('click', () => {
  input.value = ''
  playAgainBtn.style.display = 'none'
  result.style.display = 'none'
  startDiv.style.display = 'block'
  resetBtn.style.display = 'none'
})

resetBtn.addEventListener('click', () => {
  highScore.resetLocalStorage()
})
