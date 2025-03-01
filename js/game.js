function openPreQuestionModal(playerName){
    const modal = document.getElementById('modal-prequestion');
    currentOpenModalId = 'modal-prequestion';

    modal.querySelector('h1').innerText = `Pass the phone to ${playerName}!`;

    modal.classList.add('visible');
    mainOverlay.classList.add('visible');
}

function closePreQuestionModal(){
    const modal = document.getElementById('modal-prequestion');
    currentOpenModalId = null;

    modal.classList.remove('visible');
    mainOverlay.classList.remove('visible');

    document.querySelector('.question-wrapper div[data-hidden=hidden]').style.display = "block";
}

function fetchQuestionsByCategory(difficulty, category){
    return new Promise(function (resolve, reject) {
        
        let xhr = new XMLHttpRequest();
        let url = `questions/${difficulty}/${category}.json`;
    
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if(this.status == 200){
                    let questions = JSON.parse(this.responseText);
                    resolve({
                        status: this.status,
                        questions: questions
                    });
                }else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            }
        };

        xhr.onerror = function(){
            reject({
                status: this.status,
                statusText: xhr.statusText
            });  
        };

        xhr.open("GET", url, true);
        xhr.send();
    });
}

function fetchAllQuestions(difficulty, categories){
    return new Promise(function (resolve, reject) {

        let allQuestionsPromises = [];

        categories.forEach(category => {
            allQuestionsPromises.push(fetchQuestionsByCategory(difficulty, category)); 
        });
        
        Promise.all(allQuestionsPromises)
            .then(results => {
                let allQuestions = [];

                results.forEach(res => {
                    allQuestions.push(...res.questions);
                });

                resolve(allQuestions)
            })
            .then(questions => {
                resolve(questions);
            })
            .catch(error => {
                console.log("ERROR", error);
                reject();
            });
    });
}

function getNextQuestion(allQuestions, chosenLanguages){
    questionNumber.innerText = `${totalQuestions}/${GAME_NUM_ROUNDS}`;

    const savedQuestionId = localStorage.getItem('currentQuestionId');
    let currentQuestion;

    if(savedQuestionId){
        currentQuestion = allQuestions.find(question => question.id == savedQuestionId);
    }else {
        currentQuestion = allQuestions[Math.floor(Math.random() * (allQuestions.length))];

    }

    localStorage.setItem('currentQuestionId', currentQuestion.id);

    const questionCategory = currentQuestion.category;

    let questionBody, currentPlayer, currentPlayers = [];
    questionWrapper.innerHTML = "";
    
    switch(questionCategory){

        case PICTIONARY:
            currentPlayer = players[currentPlayerTurnIndex];
            involvedPlayers = [currentPlayer];
            console.log(currentPlayer);

            mainLogo.src = 'images/pictionary.png';
            openPreQuestionModal(currentPlayer);
            questionBody = document.importNode(pictionaryTemplate.content, true);
            questionBody.querySelector('.question-title').innerText = `${currentPlayer}, Make Them Guess This Image`;
            questionBody.querySelector('div[data-hidden=hidden]').style.display = 'none';
        //    questionBody.querySelector('img').src = `pictionary/${currentQuestion.image}`;
// Fetch a random image from the web
 fetch('https://picsum.photos/400/300')
  .then(response => {
    questionBody.querySelector('img').src = response.url;
  })
  .catch(error => console.error('Error loading the image:', error));

            currentPlayerTurnIndex = (currentPlayerTurnIndex+1) % players.length;
            break;

        case DARE:
            if(currentQuestion.num_players > players.length-1){
                localStorage.removeItem('currentQuestionId');
                getNextQuestion(allQuestions, chosenLanguages);
                return;
            }

            currentPlayers = [];

            while(currentPlayers.length < currentQuestion.num_players){
                currentPlayers.push(players[currentPlayerTurnIndex]);
                currentPlayerTurnIndex = (currentPlayerTurnIndex+1) % players.length;
            }

            involvedPlayers = [...currentPlayers];

            mainLogo.src = 'images/dare.png';
            questionBody = document.importNode(dareTemplate.content, true);
            chosenLanguages.forEach((lang) => {
                let temp_question = currentQuestion[lang];
                for(let i=0;i<currentPlayers.length;i++){
                    temp_question = temp_question.replace('{}', currentPlayers[i]);
                }
                questionBody.querySelector(`.dare-${lang}`).innerText = temp_question;
            });
            break;

        case TRIPLE_T:
            currentPlayer = players[currentPlayerTurnIndex];

            involvedPlayers = [currentPlayer];

            mainLogo.src = 'images/triplet.png';
            questionBody = document.importNode(tripleTTemplate.content, true);
            chosenLanguages.forEach((lang) => {
                questionBody.querySelector(`.truth-${lang}`).innerText = currentQuestion[lang].replace('{}', currentPlayer);
            });

            currentPlayerTurnIndex = (currentPlayerTurnIndex+1) % players.length;
            break;

        case GUESS_THE_SONG:
            currentPlayer = players[currentPlayerTurnIndex];
            console.log(currentPlayer);

            involvedPlayers = [currentPlayer];

            mainLogo.src = 'images/guess_the_song.png';
            openPreQuestionModal(currentPlayer);
            questionBody = document.importNode(guessTheSongTemplate.content, true);
            questionBody.querySelector('.question-title').innerText = `${currentPlayer}, Make Them Guess This Song`;
            questionBody.querySelector('div[data-hidden=hidden]').style.display = 'none';
            questionBody.querySelector('.question-guessthesong').innerText = currentQuestion.song;

            currentPlayerTurnIndex = (currentPlayerTurnIndex+1) % players.length;
            break;
    }

    questionWrapper.appendChild(questionBody);

    return currentQuestion;
}

const PICTIONARY = 'pictionary', DARE = 'dare', TRIPLE_T = 'triplet', GUESS_THE_SONG = 'guessthesong', GAME_NUM_ROUNDS = 2;

const mainLogo = document.getElementById('main-logo');
const questionNumber = document.getElementById('question-number');
const closeModalPrequestionBtn = document.getElementById('close-modal-prequestion');
const pictionaryTemplate = document.getElementById('template-pictionary');
const dareTemplate = document.getElementById('template-dare');
const tripleTTemplate = document.getElementById('template-triplet');
const guessTheSongTemplate = document.getElementById('template-guessthesong');
const questionWrapper = document.getElementById('question-wrapper');
const correctAnswerBtn = document.getElementById('correct-answer');
const wrongAnswerBtn = document.getElementById('wrong-answer');

closeModalPrequestionBtn.addEventListener('click', closePreQuestionModal);

const players = JSON.parse(localStorage.getItem('players'));
const difficulty = localStorage.getItem('difficulty');
const categories = JSON.parse(localStorage.getItem('categories'));

let currentQuestion;
let totalQuestions = localStorage.getItem('totalQuestions');
let currentPlayerTurnIndex = Number.parseInt(localStorage.getItem('currentPlayerTurnIndex'));
let involvedPlayers = [];
let allQuestions;
let answeredQuestionsIds;

if(localStorage.getItem('answeredQuestionsIds') === 'null'){
    answeredQuestionsIds = [];
}
else {
    answeredQuestionsIds = JSON.parse(localStorage.getItem('answeredQuestionsIds'));
}

fetchAllQuestions(difficulty, categories).then(function(questions){
    console.log(questions);
    let tempAnsweredIds = [...answeredQuestionsIds];

    while(tempAnsweredIds.length != 0){
        let toBeRemovedId = tempAnsweredIds.pop();
        let toBeRemovedIndex = questions.findIndex(question => question.id == toBeRemovedId);

        console.log('TO BE REMOVED INDEX', toBeRemovedIndex, 'ID', toBeRemovedId);
        if(toBeRemovedIndex != -1){
            questions.splice(toBeRemovedIndex, 1);
        }
        
    }
    console.log(tempAnsweredIds);
    console.log(answeredQuestionsIds);
    allQuestions = questions;
    console.log(allQuestions);
    currentQuestion = getNextQuestion(questions, chosenLanguages);
});

correctAnswerBtn.addEventListener('click', function(){
    if(localStorage.getItem('gameStatus') != 'Running'){
        location.href = 'postgame.html';
        return;
    }

    let scoreboard = JSON.parse(localStorage.getItem('scoreboard'));

    involvedPlayers.forEach(player => {
        scoreboard[player].T++;
        scoreboard[player].S++;
    });

    answeredQuestionsIds.push(currentQuestion.id);
    allQuestions = allQuestions.filter(question => question.id != currentQuestion.id);

    console.log(allQuestions);

    localStorage.setItem('totalQuestions', ++totalQuestions);
    localStorage.setItem('currentPlayerTurnIndex', currentPlayerTurnIndex);
    localStorage.setItem('answeredQuestionsIds', JSON.stringify(answeredQuestionsIds));
    localStorage.setItem('scoreboard', JSON.stringify(scoreboard));

    if(totalQuestions <= GAME_NUM_ROUNDS){
        localStorage.removeItem('currentQuestionId');
        currentQuestion = getNextQuestion(allQuestions, chosenLanguages);
    }else {
        console.log('STOP');
        localStorage.setItem('gameStatus', 'Ended');
        location.href = 'postgame.html';
    }

});

wrongAnswerBtn.addEventListener('click', function(){
    if(localStorage.getItem('gameStatus') != 'Running'){
        location.href = 'postgame.html';
        return;
    }

    let scoreboard = JSON.parse(localStorage.getItem('scoreboard'));

    involvedPlayers.forEach(player => {
        scoreboard[player].T++;
    });

    answeredQuestionsIds.push(currentQuestion.id);
    allQuestions = allQuestions.filter(question => question.id != currentQuestion.id);

    console.log(allQuestions);

    localStorage.setItem('totalQuestions', ++totalQuestions);
    localStorage.setItem('currentPlayerTurnIndex', currentPlayerTurnIndex);
    localStorage.setItem('answeredQuestionsIds', JSON.stringify(answeredQuestionsIds));
    localStorage.setItem('scoreboard', JSON.stringify(scoreboard));

    if(totalQuestions <= GAME_NUM_ROUNDS){
        localStorage.removeItem('currentQuestionId');
        currentQuestion = getNextQuestion(allQuestions, chosenLanguages);
    }else {
        console.log('STOP');
        localStorage.setItem('gameStatus', 'Ended');
        location.href = 'postgame.html';
    }

});
