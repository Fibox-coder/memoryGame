"use strict";

// constructor for every card
class Card {
  constructor(cardObject) {
    this.card1 = cardObject.card1;
    this.card2 = cardObject.card2;
    this.set = cardObject.set;
    this.sound = cardObject.sound;
  }
}

const selectOptions = document.getElementById('selectOptions') // gets the select options
const myField = document.getElementById('field'); // gets the board where the tiles will be placed
const modal = document.getElementById('modal')
const overlay = document.getElementById('overlay')
const exitHighScore = document.getElementById('exitHighScore')
const viewHighscore = document.getElementById('viewHighscore')
const highscoreText = document.getElementById('highscoreText')
let timerDisplay = document.getElementById('time')
let reset = document.getElementById('reset')
let user = document.getElementById('user')
let myCardArray = ["duck", "kitten", "piglet", "puppy", "calf", "veal", "lamb", "rooster", "horse", "mouse", "dog", "cat", "goose", "goat", "sheep", "pig", "cow", "chick", "hen"]; // main array
let myCardSet = [] // Array that will be doubled after getting the correct amount of cards.
let boardClass // determines if board will be 4x4, 5x5 or 6x6
let cardOne = ""
let cardTwo = ""
let attempts = 0
let score = 0
let interval;
let seconds
let setTimeoutTimer = false // returns true when setTimeout() is active and false when its done.

// timer function
function timeSpend() {
  if (selectOptions.value === "") {
    // if the option 'Kies een speelveld' is selected, timer = 0
    seconds = 0
    timerDisplay.innerHTML = `Time: ${seconds}`
  } else {
    // get the time div, and create a new Date variable
    let startTime = Date.now();
    // Sets date to 0, return value in seconds, display it
    interval = setInterval(function () {
      let elapsedTime = Date.now() - startTime;
      seconds = Math.floor(elapsedTime / 1000);
      timerDisplay.innerHTML = `Time: ${seconds}`
    }, 1000);
  }
}

selectOptions.addEventListener("change", onSelectFieldSize) // board size option
myField.addEventListener("click", onClickCard); // removes cover and logs which card was clicked
reset.addEventListener("click", resetGame) // resets game when pressing reset button

// gets random cards based on board size
function cardSize() {
  shuffle(myCardArray) // Shuffles original array
  myCardSet = [] // resets array that is shown 
  let totalSingleCards = Math.floor(+selectOptions.value * +selectOptions.value / 2) // returns 8, 12 or 18, depending on field size.
  for (let i = 0; i < totalSingleCards; i++) { // pushes total unique cards (8,12,18) into the myDblCardArray
    myCardSet.push(myCardArray[i])
  }
}

// doubles those cards 
function cardDouble() {
  myCardSet.push(...myCardSet) // doubles the Array
  shuffle(myCardSet) // Randomizes where the cards appear
}

// switch option for picking board size (4x4, 5x5, 6x6)
function onSelectFieldSize() {
  switch (selectOptions.value) {
    case "4":
      boardClass = "board4";
      break;
    case "5":
      boardClass = "board5";
      break;
    case "6":
      boardClass = "board6";
      break;
  }
  resetScore() // resets score and timer when picking new board
  cardSize() // gets random cards based on board size
  cardDouble() // doubles those cards 
  populateField(myCardSet) // creates the layout
  timeSpend() // keeps track of the time when you change the board.
}

// Resets the score and timer
function resetScore() {
  cardOne = ""
  cardTwo = ""
  attempts = 0
  score = 0
  updateScore()
  clearInterval(interval)
  seconds = 0
  timerDisplay.innerHTML = `Time: ${seconds}`
}

// for every card in the array, create a div with the image and cover
function populateField(myCardSet) {
  myField.innerHTML = "";
  myCardSet.forEach(card => {
    let newTile = document.createElement("div");
    let newCard = document.createElement("img");
    let cover = document.createElement("img");
    newTile.setAttribute("class", boardClass);
    let imageURL = "img/" + card + ".jpg";
    newCard.setAttribute("src", imageURL);
    cover.setAttribute("src", 'img/cover.png')
    cover.setAttribute("class", "covered")
    newCard.setAttribute("name", card);
    newTile.appendChild(newCard);
    newTile.appendChild(cover);
    myField.appendChild(newTile);
  });
}

// Removes the cover, and console logs the name of the card.
function onClickCard(e) {
  // check if image is pressed and covered
  if (e.srcElement.tagName === "IMG" && e.target.className === "covered") {
    // uncover
    e.target.className = "uncovered"
    // check if cardOne already has a value, if no give it the value, else give cardTwo the value
    if (cardOne === "") {
      cardOne = e.target.parentNode.firstChild
    } else {
      cardTwo = e.target.parentNode.firstChild
    }
    audioSound(e) // play animal sound
    evaluateMatch() // Check if it is a match
  }
}

// Makes an animal sound play.
function audioSound(e) {
  let audio = new Audio()
  audio.src = 'js/snd/' + e.target.parentNode.firstChild.name + ".wav";
  audio.play();
}

function evaluateMatch() {
  if (cardOne.name === cardTwo.name) {
    // add 1 to score and attempt 
    attempts++
    score++
    // remove the event listener (and reset option) until timer is done
    myField.removeEventListener("click", onClickCard);
    setTimeoutTimer = true
    // If card one and two are the same, take them out of game
    setTimeout(function () {
      cardOne.parentNode.style.visibility = "hidden";
      cardTwo.parentNode.style.visibility = "hidden";
      resetCards()
      myField.addEventListener("click", onClickCard);
      setTimeoutTimer = false
    }, 2000);
    checkGameWon()
  } else if (cardTwo === "") {
    // do nothing till both cards are picked
  } else {
    // add 1 to attempt
    attempts++
    // remove the event listener (and reset option) until timer is done
    myField.removeEventListener("click", onClickCard);
    setTimeoutTimer = true
    // If Card one and two are not the same, cover up again
    setTimeout(function () {
      cardOne.parentNode.children[1].className = "covered";
      cardTwo.parentNode.children[1].className = "covered";
      resetCards()
      myField.addEventListener("click", onClickCard);
      setTimeoutTimer = false
    }, 2000);
  }
  updateScore()
}

// Updates score on screen
function updateScore() {
  document.getElementById('attempts').innerText = `Attempts: ${attempts}`;
  document.getElementById('score').innerText = `Score: ${score}`;
}

// reset cards
function resetCards() {
  cardOne = ""
  cardTwo = ""
}

// resets game while keeping same board size
function resetGame() {
  // setTimeoutTimer is true until the setTimeout function is done playing (to prevent bugs)
  if (setTimeoutTimer) { }
  else {
    onSelectFieldSize()
  }
}

// Fisher–Yates Shuffle (randomize function)
function shuffle(array) {
  var m = array.length, t, i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
}

// fetch data from a json file, then create Card objects for every card
fetch("js/cards.json")
  .then(response => response.json())
  .then(data => {
    myCardSet = data.map(card => new Card(card));
  })

// Gets userName and adds a welcome message. If userName is not defined, asks for it with prompt.
let userName = localStorage.getItem('userName');
if (!userName) {
  userName = prompt('What is your name?');
  localStorage.setItem('userName', userName);
}
user.innerHTML = `Welcome, ${userName}!`

// gets all highscores from localStorage, if null return 0
function getHighScore(key) {
  let value = localStorage.getItem(key)
  return value === null ? 0 : value
}

let highScore4x4 = getHighScore('highScore4x4')
let highScore5x5 = getHighScore('highScore5x5')
let highScore6x6 = getHighScore('highScore6x6')
let highScoreTime4x4 = getHighScore('highScoreTime4x4')
let highScoreTime5x5 = getHighScore('highScoreTime5x5')
let highScoreTime6x6 = getHighScore('highScoreTime6x6')

// function to update all the localStorage values after they have been set
function updateHighScores() {
  highScore4x4 = getHighScore('highScore4x4')
  highScore5x5 = getHighScore('highScore5x5')
  highScore6x6 = getHighScore('highScore6x6')
  highScoreTime4x4 = getHighScore('highScoreTime4x4')
  highScoreTime5x5 = getHighScore('highScoreTime5x5')
  highScoreTime6x6 = getHighScore('highScoreTime6x6')
}

function modalLayout() {
  // Highscore layout that shows once clicked on button
  document.getElementById('attempts4x4').innerHTML = `Attempts: ${highScore4x4}`
  document.getElementById('attempts5x5').innerHTML = `Attempts: ${highScore5x5}`
  document.getElementById('attempts6x6').innerHTML = `Attempts: ${highScore6x6}`
  document.getElementById('time4x4').innerHTML = `Fastest time: ${highScoreTime4x4}`
  document.getElementById('time5x5').innerHTML = `Fastest time: ${highScoreTime5x5}`
  document.getElementById('time6x6').innerHTML = `Fastest time: ${highScoreTime6x6}`
  // Shows the modal with highscore
  modal.style.display = "block";
  overlay.style.display = "block";
}

// When the user clicks anywhere outside of the modal or the X, close it
window.onclick = function (event) {
  if (event.target == overlay || event.target === exitHighScore) {
    modal.style.display = "none";
    overlay.style.display = "none";
  }
}

// Show Highscore when clicking on button
viewHighscore.addEventListener('click', modalLayout)

//Checks which board is played on and if it has been completed. Then compare highScore
function checkGameWon() {
  switch (selectOptions.value) {
    case "4":
      if (score === 8) {
        // Check for new highScore -> Update highScore -> show highScore screen -> stop timer
        highScoreLogic(highScore4x4, highScoreTime4x4, '4x4')
        updateHighScores()
        modalLayout()
        clearInterval(interval)
      }
      break;
    case "5":
      if (score === 12) {
        // Check for new highScore -> Update highScore -> show highScore screen -> stop timer
        highScoreLogic(highScore5x5, highScoreTime5x5, '5x5')
        updateHighScores()
        modalLayout()
        clearInterval(interval)
      }
      break;
    case "6":
      if (score === 18) {
        // Check for new highScore -> Update highScore -> show highScore screen -> stop timer
        highScoreLogic(highScore6x6, highScoreTime6x6, '6x6')
        updateHighScores()
        modalLayout()
        clearInterval(interval)
      }
      break;
  }
}

// Function that finds if the highscore is reached. Attempts are more important than Time.
function highScoreLogic(highScoreAttempts, highScoreTimer, boardSize) {
  if (highScoreAttempts === 0) {
    highscoreText.innerHTML = `New Highscore for ${boardSize}!`
    // save new highScore in localStorage first time completing the game
    localStorage.setItem("highScore" + boardSize, attempts);
    localStorage.setItem("highScoreTime" + boardSize, seconds);
  } else if (Number(highScoreAttempts) > attempts) {
    highscoreText.innerHTML = `New Highscore for ${boardSize}!`
    // save new highScore in localStorage when attempts are lower
    localStorage.setItem("highScore" + boardSize, attempts);
    localStorage.setItem("highScoreTime" + boardSize, seconds);
  } else if (Number(highScoreAttempts) === attempts && Number(highScoreTimer) > seconds) {
    // save new highScore when attempts are the same, but completed faster
    localStorage.setItem("highScoreTime" + boardSize, seconds);
    highscoreText.innerHTML = `New Highscore for ${boardSize}!`
  } else {
    // highScore not beaten
    highscoreText.innerHTML = "No new Highscore!"
  }
}

// localStorage.clear(); will reset localStorage to default