var canvas = document.getElementById("jogo");
var ctx = canvas.getContext("2d");

var boardSize = 600;
var block = 3;
var blockSize = boardSize / block; // 200px
var currentPlayer = 1;

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

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();

  const position = {
    x: Math.floor((event.clientX - rect.left) / blockSize),
    y: Math.floor((event.clientY - rect.left) / blockSize),
  };

  if (currentPlayer === 1) {
    drawX(position.x, position.y);
  } else {
    drawO(position.x, position.y);
  }

  currentPlayer *= -1;
});

paintBoard();
