import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  onChildAdded,
  onChildChanged,
  onValue,
  push,
  query,
  equalTo,
  orderByChild,
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAC4cBN5BGmQGCsOEP6PkhiRXTxflSZu-E",
  authDomain: "jogo-da-velha-c1412.firebaseapp.com",
  projectId: "jogo-da-velha-c1412",
  storageBucket: "jogo-da-velha-c1412.appspot.com",
  messagingSenderId: "732463302278",
  appId: "1:732463302278:web:ccd83f99cf00ef5bda7307",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();

var canvas = document.getElementById("jogo");
var ctx = canvas.getContext("2d");

var boardSize = 600;
var block = 3;
var blockSize = boardSize / block; // 200px
var name = "";

var game = [];

var currentGame = null;
var currentKey = null;

async function init() {
  name = prompt("Qual seu nome?");
  jQuery("#server #name").append(name);

  const oldGames = await get(
    query(ref(db, "games"), orderByChild("player1"), equalTo(name))
  );

  for (const oldGameKey of Object.keys(oldGames.val() || {})) {
    remove(ref(db, `games/${oldGameKey}`));
  }

  onValue(
    query(ref(db, "/games"), orderByChild("player2"), equalTo(null)),
    (games) => {
      const allGames = Object.keys(games.val() || {});

      if (allGames.length > 0) {
        jQuery("#games").show();
      } else {
        jQuery("#games").hide();
      }

      jQuery("#active_games").empty();
      for (const key of allGames) {
        const game = games.val()[key];
        if (game.player1 === name) continue;
        jQuery("#active_games").append(
          `<li>${game.player1}<button id="game_${game.player1}"  type="button" class="btn btn-primary">Entrar no jogo</button></li>`
        );
        jQuery(`#game_${game.player1}`).click(() => {
          const gameListRef = ref(db, `games/${key}`);
          set(gameListRef, { ...game, player2: name });
        });
      }
    }
  );

  onValue(
    query(ref(db, "/games"), orderByChild("player1"), equalTo(name)),
    (data) => {
      if (!data.val()) return;
      const pl = Object.values(data.val() || {})[0];
      currentKey = Object.keys(data.val() || {})[0];
      currentGame = pl;
      console.log("P1", currentGame);
      jQuery("#newGame").hide();
      jQuery("#games").hide();
      jQuery("#jogo").show();

      jQuery("#name").empty()
      jQuery("#name").append(
        `${currentGame.player1} (${
          (currentGame.win && currentGame.win.filter((f) => f === 1).length) ||
          0
        })`
      );

      paintBoard();
    }
  );

  onValue(
    query(ref(db, "/games"), orderByChild("player2"), equalTo(name)),
    (data) => {
      if (!data.val()) return;
      const pl = Object.values(data.val() || {})[0];
      currentKey = Object.keys(data.val() || {})[0];
      currentGame = pl;

      console.log("P2", currentGame);
      jQuery("#newGame").hide();
      jQuery("#games").hide();
      jQuery("#jogo").show();

      jQuery("#name").empty()
      jQuery("#name").append(
        `${currentGame.player1} (${
          (currentGame.win && currentGame.win.filter((f) => f === -1).length) ||
          0
        })`
      );

      paintBoard();
    }
  );

  jQuery("#newGame").click(async () => {
    const gameListRef = ref(db, "games");
    const newGameRef = push(gameListRef);

    initGame();

    set(newGameRef, {
      player1: name,
      player2: null,
      currentPlayer: 1,
      win: [],
      game,
    });
  });
}

function initGame() {
  game = [];
  for (let x = 0; x < block; x++) {
    game.push([]);

    for (let y = 0; y < block; y++) {
      game[x].push(0);
    }
  }
}

function paintBoard() {
  ctx.clearRect(0, 0, boardSize, boardSize);

  ctx.beginPath();
  ctx.lineWidth = 3;

  for (var i = 1; i < block; i++) {
    // Linhas verticais
    ctx.moveTo(blockSize * i, 0);
    ctx.lineTo(blockSize * i, boardSize);

    // Linhas horizontais
    ctx.moveTo(0, blockSize * i);
    ctx.lineTo(boardSize, blockSize * i);
  }
  ctx.stroke();

  for (let x = 0; x < block; x++) {
    for (let y = 0; y < block; y++) {
      if (currentGame.game[x][y] === 1) {
        drawX(x, y);
      } else if (currentGame.game[x][y] === -1) {
        drawO(x, y);
      }
    }
  }

  ctx.stroke();

  if (checkWin()) {
    setTimeout(
      alert(
        `O jogador ${
          currentGame.currentPlayer === 1
            ? currentGame.player2
            : currentGame.player1
        } ganhou`
      ),
      500
    );

    if (
      (currentGame.currentPlayer === 1 && currentGame.player1 === name) ||
      (currentGame.currentPlayer === 2 && currentGame.player2 === name)
    ) {
      initGame();
      if (!currentGame.win) {
        currentGame.win = [];
      }
      currentGame.win.push(currentGame.currentPlayer * -1);
      const gameListRef = ref(db, `games/${currentKey}`);
      set(gameListRef, {
        ...currentGame,
        game,
      });
    }
  } else if (checkLost()) {
    alert("Deu velha");
  }
}

function drawX(x, y) {
  ctx.beginPath();
  ctx.lineWidth = 5;

  x = x * blockSize;
  y = y * blockSize;

  const offset = 10;

  ctx.moveTo(x + offset, y + offset);
  ctx.lineTo(x + blockSize - offset, y + blockSize - offset);

  ctx.moveTo(x + offset, y + blockSize - offset);
  ctx.lineTo(x + blockSize - offset, y + offset);

  ctx.stroke();
}

function drawO(x, y) {
  ctx.beginPath();

  x = x * blockSize + blockSize / 2;
  y = y * blockSize + blockSize / 2;
  const offset = 10;
  const radius = blockSize / 2 - offset;

  ctx.arc(x, y, radius, 0, 2 * Math.PI);

  ctx.stroke();
}

function checkWin() {
  let transversal = 0;
  let transversalInvertida = 0;
  for (let x = 0; x < block; x++) {
    let vertical = 0;
    let horizontal = 0;

    transversal += currentGame.game[x][x];
    transversalInvertida += currentGame.game[x][block - 1 - x];

    for (let y = 0; y < block; y++) {
      vertical += currentGame.game[x][y];
      horizontal += currentGame.game[y][x];
    }

    if (vertical === block || vertical === -block) {
      return true;
    }

    if (horizontal === block || horizontal === -block) {
      return true;
    }
  }

  if (transversal === block || transversal === -block) {
    return true;
  }

  if (transversalInvertida === block || transversalInvertida === -block) {
    return true;
  }

  return false;
}

function checkLost() {
  for (let x = 0; x < block; x++) {
    for (let y = 0; y < block; y++) {
      if (currentGame.game[x][y] === 0) {
        return false;
      }
    }
  }

  return true;
}

function play({ x, y }) {
  if (currentGame.game[x][y] !== 0) {
    return;
  }

  if (currentGame.currentPlayer === 0) {
    paintBoard();
    return;
  }

  if (currentGame.currentPlayer === 1 && currentGame.player1 === name) {
    drawX(x, y);
  } else if (currentGame.currentPlayer === -1 && currentGame.player2 === name) {
    drawO(x, y);
  } else {
    alert("Aguarde o outro jogador");
    return;
  }

  currentGame.game[x][y] = currentGame.currentPlayer;
  currentGame.currentPlayer *= -1;

  const gameRef = ref(db, `games/${currentKey}`);
  set(gameRef, currentGame);
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();

  const position = {
    x: Math.floor((event.clientX - rect.left) / blockSize),
    y: Math.floor((event.clientY - rect.left) / blockSize),
  };

  play(position);
});

init();
