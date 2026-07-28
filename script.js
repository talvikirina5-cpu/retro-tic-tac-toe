// Обозначения игроков.
const PLAYER = "X";
const COMPUTER = "O";

// Все возможные выигрышные комбинации индексов.
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Получаем нужные элементы страницы.
const cells = Array.from(document.querySelectorAll(".cell"));
const statusElement = document.querySelector("#status");
const restartButton = document.querySelector("#restart-button");
const playerScoreElement = document.querySelector("#player-score");
const computerScoreElement = document.querySelector("#computer-score");
const drawScoreElement = document.querySelector("#draw-score");

// Текущее состояние игрового раунда и счёта.
let board = Array(9).fill("");
let isGameActive = true;
let isComputerThinking = false;
let computerTimer = null;
const score = {
  player: 0,
  computer: 0,
  draws: 0
};

// Обрабатываем ход игрока.
function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  // Нельзя ходить в занятую клетку, после конца игры или во время хода компьютера.
  if (board[index] !== "" || !isGameActive || isComputerThinking) {
    return;
  }

  makeMove(index, PLAYER);

  if (finishRoundIfNeeded(PLAYER)) {
    return;
  }

  // Небольшая пауза делает автоматический ход понятнее для игрока.
  isComputerThinking = true;
  statusElement.textContent = "Компьютер думает...";
  computerTimer = window.setTimeout(makeComputerMove, 500);
}

// Записываем ход в массив и показываем его на странице.
function makeMove(index, symbol) {
  board[index] = symbol;
  cells[index].textContent = symbol;
  cells[index].disabled = true;
  cells[index].setAttribute(
    "aria-label",
    `Клетка ${index + 1}: ${symbol === PLAYER ? "крестик" : "нолик"}`
  );

  if (symbol === COMPUTER) {
    cells[index].classList.add("cell--computer");
  }
}

// Компьютер выбирает клетку и делает ход.
function makeComputerMove() {
  computerTimer = null;

  if (!isGameActive) {
    isComputerThinking = false;
    return;
  }

  const index = chooseComputerMove();
  makeMove(index, COMPUTER);
  isComputerThinking = false;

  if (!finishRoundIfNeeded(COMPUTER)) {
    statusElement.textContent = "Ваш ход — выберите клетку";
  }
}

// Стратегия: победить, заблокировать игрока, занять центр/угол или свободную клетку.
function chooseComputerMove() {
  const winningMove = findImportantMove(COMPUTER);
  if (winningMove !== null) return winningMove;

  const blockingMove = findImportantMove(PLAYER);
  if (blockingMove !== null) return blockingMove;

  if (board[4] === "") return 4;

  const freeCorners = [0, 2, 6, 8].filter((index) => board[index] === "");
  if (freeCorners.length > 0) return randomItem(freeCorners);

  return randomItem(getFreeCells());
}

// Ищем клетку, которая завершает выигрышную комбинацию для указанного символа.
function findImportantMove(symbol) {
  for (const combination of WINNING_COMBINATIONS) {
    const symbols = combination.map((index) => board[index]);
    const symbolCount = symbols.filter((value) => value === symbol).length;
    const emptyPosition = symbols.indexOf("");

    if (symbolCount === 2 && emptyPosition !== -1) {
      return combination[emptyPosition];
    }
  }

  return null;
}

function getFreeCells() {
  return board
    .map((value, index) => (value === "" ? index : null))
    .filter((index) => index !== null);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// Проверяем победу или ничью после каждого хода.
function finishRoundIfNeeded(symbol) {
  const winningCombination = getWinningCombination(symbol);

  if (winningCombination) {
    endRound(symbol, winningCombination);
    return true;
  }

  if (getFreeCells().length === 0) {
    endRound("draw");
    return true;
  }

  return false;
}

function getWinningCombination(symbol) {
  return WINNING_COMBINATIONS.find((combination) =>
    combination.every((index) => board[index] === symbol)
  );
}

// Завершаем раунд, обновляем табло и подсвечиваем победную линию.
function endRound(result, winningCombination = []) {
  isGameActive = false;
  isComputerThinking = false;
  cells.forEach((cell) => {
    cell.disabled = true;
  });

  winningCombination.forEach((index) => {
    cells[index].classList.add("cell--winner");
  });

  if (result === PLAYER) {
    score.player += 1;
    statusElement.textContent = "Вы победили! Отличная партия.";
  } else if (result === COMPUTER) {
    score.computer += 1;
    statusElement.textContent = "Компьютер победил. Попробуйте ещё раз!";
  } else {
    score.draws += 1;
    statusElement.textContent = "Ничья! Силы оказались равны.";
  }

  updateScoreboard();
}

function updateScoreboard() {
  playerScoreElement.textContent = score.player;
  computerScoreElement.textContent = score.computer;
  drawScoreElement.textContent = score.draws;
}

// Очищаем только поле: общий счёт остаётся на табло.
function restartGame() {
  window.clearTimeout(computerTimer);
  computerTimer = null;
  board = Array(9).fill("");
  isGameActive = true;
  isComputerThinking = false;
  statusElement.textContent = "Ваш ход — выберите клетку";

  cells.forEach((cell, index) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.classList.remove("cell--computer", "cell--winner");
    cell.setAttribute("aria-label", `Клетка ${index + 1}`);
  });

  cells[0].focus();
}

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

restartButton.addEventListener("click", restartGame);
