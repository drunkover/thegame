function addPlayer(){
    const playerName = nameInput.value
                                .trim()
                                .toLowerCase()
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
    
    if(totalPlayers === MAX_PLAYERS || playerName.length === 0 || players.includes(playerName)){
        return;
    }
    
    const playerElement = document.createElement('div');
    playerElement.className = 'player';
    const playerElementBody = document.importNode(playerTemplateElement.content, true);
    playerElementBody.querySelector('label').innerText = playerName;
    playerElement.appendChild(playerElementBody);
    players.push(playerName);

    playersListElement.appendChild(playerElement);
    totalPlayers++;
    nameInput.value = '';
}

const closeRulesModalBtn = document.getElementById('close-rules-modal');
const difficultiesBtns = document.querySelectorAll('.difficulty');
const categoriesBtns = document.querySelectorAll('.category');
const playerTemplateElement = document.getElementById('player-template');
const playersListElement = document.getElementById('players-list');
const nameInput = document.getElementById('input-name');
const addPlayerBtn = document.getElementById('add-player');
const gameRulesBtn = document.getElementById('btn-help');
const startGameBtn = document.getElementById('start-game');

let players=[], totalPlayers = 0;

for(let difficultyBtn of difficultiesBtns){
    difficultyBtn.addEventListener('click', function(){
        difficultiesBtns.forEach(element => element.classList.remove('chosen'));
        this.classList.add('chosen');
    });
}

for(let categoryBtn of categoriesBtns){
    categoryBtn.addEventListener('click', function(){
        this.classList.toggle('chosen');
    });
}

nameInput.addEventListener('keypress', function(event){
    if(event.key === 'Enter'){
        addPlayer();
    }
});

addPlayerBtn.addEventListener('click', addPlayer);

playersListElement.addEventListener('click', function(event){

    if(event.target.parentElement.classList.contains('remove-player')){
        const playerElement = event.target.closest('.player');
        players.splice(players.indexOf(playerElement.querySelector('label').innerText), 1);
        playerElement.remove();
        totalPlayers--;
    }
});

gameRulesBtn.addEventListener('click', openModal.bind(null, 'modal-rules'));
closeRulesModalBtn.addEventListener('click', closeModal.bind(null, 'modal-rules'));

startGameBtn.addEventListener('click', function(){
    const playersList = [];
    const categories = [];
    const difficulty = document.querySelector('.difficulty.chosen').dataset.difficulty;
    let invalidSubmit = false;

    categoriesBtns.forEach(element => {
        if(element.classList.contains('chosen')){
            categories.push(element.dataset.category);
        }
    });
    
    document.querySelectorAll('.player label').forEach(element => playersList.push(element.innerText));

    if(categories.length === 0){
        document.querySelector('.section-categories h1').style.color = 'var(--red)';
        invalidSubmit = true;
    }else {
        document.querySelector('.section-categories h1').style.color = 'var(--green)';
    }

    if(playersList.length < MIN_PLAYERS){
        document.querySelector('.section-players h1').style.color = 'var(--red)';
        invalidSubmit = true;
    }else {
        document.querySelector('.section-players h1').style.color = 'var(--green)';
    }

    if(invalidSubmit){
        return;
    }

    const languages = JSON.parse(localStorage.getItem('languages'));
    localStorage.clear();
    localStorage.setItem('languages', JSON.stringify(languages));
    localStorage.setItem('version', GAME_VERSION);
    localStorage.setItem('totalQuestions', 1);
    localStorage.setItem('currentPlayerTurnIndex', 0);
    localStorage.setItem('answeredQuestionsIds', null);
    localStorage.setItem('gameStatus', 'Running');
    localStorage.setItem('difficulty', difficulty);
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('players', JSON.stringify(playersList));

    let scoreboard = {};

    playersList.forEach(player => scoreboard[player] = {T: 0, S: 0});
    localStorage.setItem('scoreboard', JSON.stringify(scoreboard));

    console.log(difficulty);
    console.log(categories);
    console.log(playersList);

    location.href = 'game.html';

});