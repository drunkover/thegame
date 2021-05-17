const MIN_PLAYERS = 2, MAX_PLAYERS = 12;

const mainOverlay = document.getElementById('main-overlay');
const languagesCheckboxes = document.querySelectorAll('.language');

let currentOpenModalId;

function openModal(modalId){
    const modal = document.getElementById(modalId);
    currentOpenModalId = modalId;

    modal.classList.add('visible');
    mainOverlay.classList.add('visible');
}

function closeModal(modalId){
    if(modalId === 'modal-prequestion'){
        return;
    }
    
    const modal = document.getElementById(modalId);
    currentOpenModalId = null;

    modal.classList.remove('visible');
    mainOverlay.classList.remove('visible');
}

// function toggleModal(modalId){
//     const modal = document.getElementById(modalId);

//     if(modal.classList.contains('visible')){
//         modal.classList.remove('visible');
//         mainOverlay.classList.remove('visible');
//     }else {
//         modal.classList.add('visible');
//         mainOverlay.classList.add('visible');
//     }
// }

mainOverlay.addEventListener('click', ()=>closeModal(currentOpenModalId));

let chosenLanguages = JSON.parse(localStorage.getItem('languages'));

if(chosenLanguages === null || chosenLanguages.length === 0){
    chosenLanguages = ['en'];
    localStorage.setItem('languages', JSON.stringify(chosenLanguages));
}

chosenLanguages.forEach(lang => document.querySelector(`input[type='checkbox'][value='${lang}']`).checked = true);

for(let languageCheckbox of languagesCheckboxes){
    languageCheckbox.addEventListener('change', function(){
        let languages = [];
        languagesCheckboxes.forEach(element => {
            if(element.checked){
                languages.push(element.value);
            }
        });
        if(languages.length === 0){
            languages.push('en');
            document.querySelector('input[type="checkbox"][value="en"]').checked = true
        }
        chosenLanguages = languages;
        localStorage.setItem('languages', JSON.stringify(languages));
    });
}
