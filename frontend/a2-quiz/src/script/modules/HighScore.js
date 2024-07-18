export default class HighScore {
  #score

  constructor (resultElement, playAgainButton, resetButton) {
    this.resultElement = resultElement
    this.playAgainButton = playAgainButton
    this.resetButton = resetButton
  }

  resetLocalStorage () {
    window.localStorage.removeItem('topScore')
    this.#score = 0
    alert('Local storage reset!')
  }

  showTopScore () {
    const storage = JSON.parse(window.localStorage.getItem('topScore')) || []
    let text = 'The list of top scores: <br>'

    storage.forEach((player, index) => {
      text += `${index + 1}. ${player.name}: ${player.score} Sec <br>`
    })

    document.querySelector('.result').innerHTML = text
    document.querySelector('.play-again').style.display = 'block'
    document.querySelector('.reset-btn').style.display = 'block'
  }

  victory (score) {
    document.querySelector('.game-container').style.display = 'none'
    document.querySelector('.game-container').style.display = 'none'
    document.querySelector('.info_box').style.display = 'none'
    document.querySelector('.result').style.display = 'block'
    const topScore = JSON.parse(window.localStorage.getItem('topScore')) ?? []

    topScore.push({
      name: document.querySelector('.name-input').value,
      score
    })

    topScore.sort((p1, p2) => p1.score - p2.score)
    topScore.splice(5)

    window.localStorage.setItem('topScore', JSON.stringify(topScore))
    alert(`Victory! Remaining Time: ${score} sec`)
    this.showTopScore(score)
  }
}
