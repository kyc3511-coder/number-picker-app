const form = document.querySelector("#picker-form");
const results = document.querySelector("#results");
const error = document.querySelector("#error");
const copyButton = document.querySelector("#copy");
const historyList = document.querySelector("#history");

let currentNumbers = [];
const history = [];

function secureRandomInt(min, max) {
  const range = max - min + 1;
  const limit = Math.floor(0x100000000 / range) * range;
  const buffer = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return min + (value % range);
}

function drawNumbers(min, max, count, unique) {
  if (!unique) return Array.from({ length: count }, () => secureRandomInt(min, max));

  const pool = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  for (let i = pool.length - 1; i > pool.length - 1 - count; i -= 1) {
    const j = secureRandomInt(0, i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(-count).sort((a, b) => a - b);
}

function renderNumbers(numbers) {
  results.replaceChildren(...numbers.map((number, index) => {
    const ball = document.createElement("span");
    ball.className = "ball";
    ball.textContent = number;
    ball.style.animationDelay = `${index * 45}ms`;
    return ball;
  }));
}

function renderHistory() {
  historyList.replaceChildren(...history.map((item) => {
    const li = document.createElement("li");
    li.textContent = item.join(", ");
    return li;
  }));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  error.textContent = "";

  const min = Number(document.querySelector("#min").value);
  const max = Number(document.querySelector("#max").value);
  const count = Number(document.querySelector("#count").value);
  const unique = document.querySelector("#unique").checked;
  const range = max - min + 1;

  if (![min, max, count].every(Number.isSafeInteger)) {
    error.textContent = "정수만 입력해 주세요.";
    return;
  }
  if (min > max) {
    error.textContent = "최솟값은 최댓값보다 작거나 같아야 해요.";
    return;
  }
  if (count < 1 || count > 100) {
    error.textContent = "뽑을 개수는 1개부터 100개까지 가능해요.";
    return;
  }
  if (range > 1_000_000) {
    error.textContent = "번호 범위는 1,000,000개 이하로 설정해 주세요.";
    return;
  }
  if (unique && count > range) {
    error.textContent = "중복 없이 뽑으려면 번호 범위가 개수보다 넓어야 해요.";
    return;
  }

  currentNumbers = drawNumbers(min, max, count, unique);
  renderNumbers(currentNumbers);
  history.unshift(currentNumbers);
  history.splice(5);
  renderHistory();
  copyButton.disabled = false;
  copyButton.textContent = "복사";
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(currentNumbers.join(", "));
  copyButton.textContent = "복사됨";
  window.setTimeout(() => { copyButton.textContent = "복사"; }, 1200);
});

