let currentInput = "0";
let previousInput = "";
let operation = null;
let shouldResetScreen = false;
let memoryValue = 0;

const displayValue = document.getElementById("currentValue");
const displayHistory = document.getElementById("history");

// Font auto-scaling according to digit length
function updateDisplay() {
  displayValue.textContent = currentInput;
  
  const length = currentInput.length;
  if (length > 12) {
    displayValue.style.fontSize = "22px";
  } else if (length > 9) {
    displayValue.style.fontSize = "28px";
  } else if (length > 6) {
    displayValue.style.fontSize = "36px";
  } else {
    displayValue.style.fontSize = "44px";
  }
}

// Append Number or Dot
function appendNumber(num) {
  if (shouldResetScreen) {
    currentInput = num === "." ? "0." : num;
    shouldResetScreen = false;
  } else {
    if (num === "." && currentInput.includes(".")) return;
    if (currentInput === "0" && num !== ".") {
      currentInput = num;
    } else {
      if (currentInput.replace("-", "").length >= 14) return;
      currentInput += num;
    }
  }
  updateDisplay();
}

function getOperatorSymbol(op) {
  switch (op) {
    case "+": return "+";
    case "-": return "−";
    case "*": return "×";
    case "/": return "÷";
    default: return "";
  }
}

// Handle Operations (+, -, *, /)
function chooseOperation(op) {
  if (operation !== null && !shouldResetScreen) {
    calculate();
  }
  operation = op;
  previousInput = currentInput;
  displayHistory.textContent = `${previousInput} ${getOperatorSymbol(op)}`;
  shouldResetScreen = true;
}

// Calculate
function calculate() {
  if (operation === null || shouldResetScreen) return;
  
  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);
  if (isNaN(prev) || isNaN(current)) return;

  let result = 0;
  switch (operation) {
    case "+":
      result = prev + current;
      break;
    case "-":
      result = prev - current;
      break;
    case "*":
      result = prev * current;
      break;
    case "/":
      if (current === 0) {
        displayHistory.textContent = `${previousInput} ÷ 0`;
        currentInput = "Error";
        operation = null;
        updateDisplay();
        shouldResetScreen = true;
        return;
      }
      result = prev / current;
      break;
  }

  // Prevent floating point anomalies
  result = Math.round(result * 100000000) / 100000000;
  
  displayHistory.textContent = `${previousInput} ${getOperatorSymbol(operation)} ${currentInput} =`;
  currentInput = result.toString();
  operation = null;
  shouldResetScreen = true;
  updateDisplay();
}

// Clear (AC)
function clearAll() {
  currentInput = "0";
  previousInput = "";
  operation = null;
  shouldResetScreen = false;
  displayHistory.textContent = "";
  updateDisplay();
}

// Memory Operations
function handleMemory(action) {
  const current = parseFloat(currentInput) || 0;

  switch (action) {
    case "mc":
      memoryValue = 0;
      break;
    case "mr":
      currentInput = memoryValue.toString();
      shouldResetScreen = true;
      updateDisplay();
      break;
    case "m-plus":
      memoryValue += current;
      shouldResetScreen = true;
      break;
    case "m-minus":
      memoryValue -= current;
      shouldResetScreen = true;
      break;
  }
}

// Listeners
document.querySelectorAll("[data-num]").forEach(btn => {
  btn.addEventListener("click", () => appendNumber(btn.dataset.num));
});

document.querySelectorAll("[data-op]").forEach(btn => {
  btn.addEventListener("click", () => chooseOperation(btn.dataset.op));
});

document.querySelector('[data-action="equals"]').addEventListener("click", calculate);
document.querySelector('[data-action="clear"]').addEventListener("click", clearAll);

document.querySelectorAll("[data-action]").forEach(btn => {
  const action = btn.dataset.action;
  if (["mc", "mr", "m-plus", "m-minus"].includes(action)) {
    btn.addEventListener("click", () => handleMemory(action));
  }
});

// Keyboard support
window.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") appendNumber(e.key);
  if (e.key === ".") appendNumber(".");
  if (e.key === "+" || e.key === "-") chooseOperation(e.key);
  if (e.key === "*") chooseOperation("*");
  if (e.key === "/") {
    e.preventDefault();
    chooseOperation("/");
  }
  if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    calculate();
  }
  if (e.key === "Escape" || e.key.toLowerCase() === "c") clearAll();
  if (e.key === "Backspace") {
    if (!shouldResetScreen && currentInput.length > 1) {
      currentInput = currentInput.slice(0, -1);
    } else {
      currentInput = "0";
    }
    updateDisplay();
  }
});