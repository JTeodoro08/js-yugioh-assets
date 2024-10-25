

let state = {};

// Função para inicializar o estado do jogo
function initializeState() {
    state = {
        score: {
            playerScore: 0,
            computerScore: 0,
            scoreBox: document.getElementById("score_points"),
        },
        cardsSprites: {
            avatar: document.getElementById("card-image"),
            name: document.getElementById("card-name"),
            type: document.getElementById("card-type"),
        },
        fieldCards: {
            player: document.getElementById("player-field-card"),
            computer: document.getElementById("computer-field-card"),
        },
        playerSides: {
            player1: "player-cards",
            player1BOX: document.querySelector("#player-cards"),
            computer: "computer-cards",
            computerBOX: document.querySelector("#computer-cards"),
        },
        actions: {
            button: document.getElementById("next-duel"),
        },
        timer: {
            timeElapsed: 0,
            intervalId: null,
            display: document.getElementById("timer-display"), // Exibir o cronômetro no HTML
        },
    };
}

const pathImages = "./src/assets/icons/";

const cardData = [
    {
        id: 0,
        name: "Blue Eyes White Dragon",
        type: "Paper",
        img: `${pathImages}dragon.png`,
        WinOf: [1],
        LoseOf: [2],
    },
    {
        id: 1,
        name: "Dark Magician",
        type: "Rock",
        img: `${pathImages}magician.png`,
        WinOf: [2],
        LoseOf: [0],
    },
    {
        id: 2,
        name: "Exodia",
        type: "Scissors",
        img: `${pathImages}exodia.png`,
        WinOf: [0],
        LoseOf: [1],
    },
];

// Função para obter um ID de carta aleatório
async function getRandomCardId() {
    const randomIndex = Math.floor(Math.random() * cardData.length);
    return cardData[randomIndex].id;
}

// Função para criar a imagem de uma carta
async function createCardImage(IdCard, fieldSide) {
    const cardImage = document.createElement("img");
    cardImage.setAttribute("height", "100px");
    cardImage.setAttribute("src", "./src/assets/icons/card-back.png");
    cardImage.setAttribute("data-id", IdCard);
    cardImage.classList.add("card");

    if (fieldSide === state.playerSides.player1) {
        cardImage.addEventListener("mouseover", () => {
            drawSelectCard(IdCard);
        });

        cardImage.addEventListener("click", () => {
            setCardsField(cardImage.getAttribute("data-id"));
        });
    }

    return cardImage;
}

// Função para configurar as cartas no campo de batalha
async function setCardsField(cardId) {
    await removeAllCardsImages();

    let computerCardId = await getRandomCardId();

    state.fieldCards.player.style.display = "block";
    state.fieldCards.computer.style.display = "block";
    
    state.fieldCards.player.src = cardData[cardId].img;
    state.fieldCards.computer.src = cardData[computerCardId].img;

    let duelResults = await checkDuelResults(cardId, computerCardId);

    await updateScore();
    await drawButton(duelResults);
    checkForWin(); // Verifica vitória após o duelo
}

// Função para esconder os detalhes da carta
async function hiddenCardsDetails() { 
    state.cardsSprites.avatar.src = "";
    state.cardsSprites.name.innerText = "";
    state.cardsSprites.type.innerText = "";
}

// Função para exibir o botão de "próximo duelo"
async function drawButton(text) {
    state.actions.button.innerText = text.toUpperCase(); 
    state.actions.button.style.display = "block"; 
    state.actions.button.onclick = () => {
        state.actions.button.style.display = "none"; // Esconde o botão após o clique
        init(); // Reinicia o duelo
    };
}

// Função para atualizar o placar
async function updateScore() {
    state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

// Função para verificar os resultados do duelo
async function checkDuelResults(playerCardId, computerCardId) {
    let duelResults = "Draw";
    let playerCard = cardData[playerCardId];

    if (playerCard.WinOf.includes(computerCardId)) {
        duelResults = "Win";
        state.score.playerScore++; 
    }

    if (playerCard.LoseOf.includes(computerCardId)) {
        duelResults = "Lose"; 
        state.score.computerScore++;
    }

    await playAudio(duelResults);
    await updateScore(); 
    return duelResults;
}

// Função para remover todas as imagens de cartas
async function removeAllCardsImages() {
    let { computerBOX, player1BOX } = state.playerSides;
    let imgElements = computerBOX.querySelectorAll("img");
    imgElements.forEach((img) => img.remove());

    imgElements = player1BOX.querySelectorAll("img");
    imgElements.forEach((img) => img.remove());
}

// Função para exibir os detalhes da carta selecionada
async function drawSelectCard(index) {
    state.cardsSprites.avatar.src = cardData[index].img;
    state.cardsSprites.name.innerText = cardData[index].name;
    state.cardsSprites.type.innerText = "Attribute: " + cardData[index].type; 
}

// Função para desenhar as cartas no campo
async function drawCards(cardNumbers, fieldSide) {
    for (let i = 0; i < cardNumbers; i++) {
        const randomIdCard = await getRandomCardId();
        const cardImage = await createCardImage(randomIdCard, fieldSide);

        document.getElementById(fieldSide).appendChild(cardImage);
    }
}

// Função para reiniciar o duelo
async function resetDuel() {
    hiddenCardsDetails(); 
    state.fieldCards.player.style.display = "none";
    state.fieldCards.computer.style.display = "none";
    state.score.playerScore = 0; // Zera o placar
    state.score.computerScore = 0; // Zera o placar
    timeLeft = 60; // Reseta o cronômetro
    updateTimerDisplay(); 
    init(); 
}

// Função para tocar o áudio correspondente ao resultado
async function playAudio(status) {
    const audio = new Audio(`./src/assets/audios/${status}.wav`);
    
    try {
        audio.play();
    } catch (err) {
        console.error("Erro ao tocar o áudio:", err);
    }
}

// Função de contagem regressiva de 60 segundos
let countdownTimer;
let timeLeft = 60; 

function startCountdown() {
    updateTimerDisplay(); 

    countdownTimer = setInterval(() => {
        timeLeft--;

        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(countdownTimer); 
            alert("O tempo acabou! O jogo terminou."); 
            resetDuel(); // Reinicia o duelo ao fim do tempo
        }
    }, 1000); 
}

// Função para atualizar o display do cronômetro
function updateTimerDisplay() {
    const timerDisplay = document.getElementById("timer-display");
    timerDisplay.innerText = `Tempo: ${timeLeft}s`;
}

// Função para verificar se o jogador ou o computador atingiu 10 pontos
function checkForWin() {
    if (state.score.playerScore >= 10) {
        alert("Parabéns! Você venceu o jogo!");
        clearInterval(countdownTimer); // Para o cronômetro
        resetDuel(); 
    } else if (state.score.computerScore >= 10) {
        alert("O computador venceu o jogo!");
        clearInterval(countdownTimer); // Para o cronômetro
        resetDuel(); 
    }
}

// Função para inicializar o jogo
function init() {
    state.fieldCards.player.style.display = "none";
    state.fieldCards.computer.style.display = "none";
    drawCards(5, state.playerSides.player1); // Corrigido: adiciona as cartas do jogador
    drawCards(5, state.playerSides.computer); // Corrigido: adiciona as cartas do computador

    
}

// Inicializa o estado após o carregamento da página
window.onload = function() {
    initializeState();
    init();
    startCountdown(); // Inicia o cronômetro quando a página carrega
    const bgm = document.getElementById("bgm");
    bgm.play();
};
