var canvas = document.getElementById("jogo");
var ctx = canvas.getContext("2d");

var boardSize = 600;
var block = 3;
var blockSize = boardSize / block; // 200px
var currentPlayer = 1;

var game = [];

for (let x = 0; x < block; x++) {
  game.push([]);

  for (let y = 0; y < block; y++) {
    game[x].push(0);
  }
}

function paintBoard() {
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
}

function drawX(x, y) {
  ctx.beginPath();
  ctx.lineWidth = 5;

  x = x * blockSize;
  y = y * blockSize;

  offset = 10;

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
  offset = 10;
  radius = blockSize / 2 - offset;

  ctx.arc(x, y, radius, 0, 2 * Math.PI);

  ctx.stroke();
}

function play({ x, y }) {
  if (game[x][y] !== 0) {
    return;
  }
  if (currentPlayer === 1) {
    drawX(x, y);
  } else {
    drawO(x, y);
  }

  game[x][y] = currentPlayer;
  currentPlayer *= -1;
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();

  const position = {
    x: Math.floor((event.clientX - rect.left) / blockSize),
    y: Math.floor((event.clientY - rect.left) / blockSize),
  };

  play(position);
});

paintBoard();
