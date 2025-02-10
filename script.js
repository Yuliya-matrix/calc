document.addEventListener("DOMContentLoaded", function () {
  initializeCalculateButton();
  initializeDateInput();
});

function initializeCalculateButton() {
  const calculateBtn = document.getElementById("calculateBtn");
  calculateBtn.removeAttribute("disabled");
  calculateBtn.addEventListener("click", handleCalculateClick);
}

function initializeDateInput() {
  const dateInput = document.getElementById("dateInput");
  if (!dateInput) return;

  dateInput.setAttribute("maxlength", "10");
  dateInput.setAttribute("placeholder", "14.03.1879");

  ["input", "paste"].forEach((eventType) => {
    dateInput.addEventListener(eventType, handleDateInput);
  });

  dateInput.addEventListener("paste", handlePaste);
  dateInput.addEventListener("keydown", preventNonNumericCharacters);
}

function handleCalculateClick() {
  const dateInput = document.getElementById("dateInput");
  if (!dateInput?.value) return;

  const dateFormatRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!dateFormatRegex.test(dateInput.value)) return;

  const dateArray = dateInput.value.replace(/\./g, "").split("");

  calculateMatrix(dateArray);
}

function handlePaste(e) {
  e.preventDefault();
  const pastedText = (e.clipboardData || window.clipboardData).getData("text");
  e.target.value = correctDate(pastedText);
}

function handleDateInput(e) {
  const { selectionStart: cursorPosition, value } = e.target;
  const oldLength = value.length;

  e.target.value = correctDate(value);

  updateCursorPosition(e.target, cursorPosition, oldLength);
}

function updateCursorPosition(element, oldPosition, oldLength) {
  const newLength = element.value.length;
  const newPosition = oldPosition + (newLength - oldLength);
  element.setSelectionRange(newPosition, newPosition);
}

function preventNonNumericCharacters(e) {
  if (isAllowedKey(e) || isControlCommand(e)) {
    return;
  }
  if (!isValidInputCharacter(e.key)) {
    e.preventDefault();
  }
}

function isAllowedKey(e) {
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  return allowedKeys.includes(e.key);
}

function isControlCommand(e) {
  return e.ctrlKey || e.metaKey;
}

function isValidInputCharacter(key) {
  return /^\d$/.test(key) || key === ".";
}

function correctDate(inputValue) {
  let digitsOnly = inputValue.replace(/[^\d]/g, "");
  const day = digitsOnly.slice(0, 2);
  const month = digitsOnly.slice(2, 4);
  const year = digitsOnly.slice(4);

  const correctedDay = correctDayValue(day);
  const correctedMonth = correctMonthValue(month);

  return formatDate(correctedDay, correctedMonth, year);
}

function correctDayValue(day) {
  if (parseInt(day, 10) > 31) {
    return "31";
  }
  if (day.length && day[0] > "3") {
    return ("000" + parseInt(day, 10)).slice(-2);
  }
  return day;
}

function correctMonthValue(month) {
  if (parseInt(month, 10) > 12) {
    return "12";
  }
  if (month.length && month[0] > "1") {
    return ("000" + parseInt(month, 10)).slice(-2);
  }
  return month;
}

function formatDate(day, month, year) {
  const dateParts = [];
  if (day.length) dateParts.push(day);
  if (month.length) dateParts.push(month);
  if (year.length) dateParts.push(year);
  return dateParts.join(".");
}

function displayGrid(data) {
  Object.entries(data).forEach(([key, value]) => {
    const contentElement = document.querySelector(`#${key} .grid-item-content`);
    if (contentElement) {
      contentElement.textContent = value;
    }
  });
}

function displayResultAndShareButton(matrix, destiny) {
  const resultElement = document.getElementById("result");
  const shareButton = document.getElementById("shareWhatsApp");
  const copyButton = document.getElementById("copyBtn");

  if (!matrix || !destiny || !resultElement) {
    console.warn("Missing required parameters or result element");
    return;
  }

  try {
    const matrixValues = [
      matrix.character ?? "-",
      matrix.energy ?? "-",
      matrix.interest ?? "-",
      matrix.health ?? "-",
      matrix.logics ?? "-",
      matrix.work ?? "-",
      matrix.luck ?? "-",
      matrix.debt ?? "-",
      matrix.memory ?? "-",
    ];

    const formattedResult = `${matrixValues.join("/")}/ ЧС${destiny}`;
    resultElement.textContent = formattedResult;

    if (shareButton) {
      shareButton.style.display = "block";
      shareButton.onclick = () => shareToWhatsApp(formattedResult);
    }

    if (copyButton) {
      copyButton.style.display = "block";
      copyButton.onclick = () => copyToClipboard(formattedResult);
    }
  } catch (error) {
    console.error("Error formatting matrix:", error);
    resultElement.textContent = "Произошла ошибка при обработке данных";
  }
}

function displayResults(matrix, additionalNumbers, destiny) {
  displayGrid({
    ...matrix,
    additionalNumbers: additionalNumbers.join(", "),
    destiny,
  });
  displayResultAndShareButton(matrix, destiny);
}

function calculateMatrix(dateArray) {
  const additionalNumbers = calculateAdditionalNumbers(dateArray);
  const destiny = destinyNumber(additionalNumbers[1]);
  const fullNumbers = getFullNumbers([...dateArray, ...additionalNumbers]);
  const matrix = getMatrix(fullNumbers);

  displayResults(matrix, additionalNumbers, destiny);
}

function calculateAdditionalNumbers(dateArray) {
  const additionalNumbers = [];
  additionalNumbers[0] = firstAdditionalNumber(dateArray);
  additionalNumbers[1] = getSumOfDigits(additionalNumbers[0]);
  additionalNumbers[2] = thirdAdditionalNumber(additionalNumbers[0], dateArray);
  additionalNumbers[3] = getSumOfDigits(additionalNumbers[2]);
  return additionalNumbers;
}

function getSumOfDigits(number) {
  return number
    .toString()
    .split("")
    .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
}

function firstAdditionalNumber(dateArray) {
  return dateArray.reduce((accumulator, currentValue) => {
    return accumulator + parseInt(currentValue, 10);
  }, 0);
}

function thirdAdditionalNumber(firstAddNum, dateArray) {
  const d1 = parseInt(dateArray[0], 10);
  const d2 = parseInt(dateArray[1], 10);
  const multiplier = d1 === 0 ? d2 : d1;
  return Math.abs(firstAddNum - 2 * multiplier);
}

function getFullNumbers(fullNumbers) {
  return fullNumbers.reduce((accumulator, number) => {
    let digits = number.toString().split("");
    digits.forEach((digit) => {
      accumulator.push(parseInt(digit, 10));
    });
    return accumulator;
  }, []);
}

function destinyNumber(secondAdditionalNum) {
  return secondAdditionalNum === 11 ? 11 : getSumOfDigits(secondAdditionalNum);
}

function getMatrix(fullNumbers) {
  const occurrences = calculateOccurrences(fullNumbers);
  const innerSquare = calculateInnerSquare(occurrences);

  return {
    ...calculateLines(occurrences),
    ...calculateSquares(innerSquare),
  };
}

function calculateOccurrences(fullNumbers) {
  const occurrences = new Array(9).fill(0);
  fullNumbers.forEach((number) => {
    if (number >= 1 && number <= 9) {
      occurrences[number - 1]++;
    }
  });
  return occurrences;
}

function calculateInnerSquare(occurrences) {
  return occurrences.map((count, index) =>
    count > 0 ? `${index + 1}`.repeat(count) : "-"
  );
}

function calculateLines(occurrences) {
  return {
    temperament: occurrences[2] + occurrences[4] + occurrences[6],
    target: occurrences[0] + occurrences[3] + occurrences[6],
    family: occurrences[1] + occurrences[4] + occurrences[7],
    habits: occurrences[2] + occurrences[5] + occurrences[8],
    life: occurrences[3] + occurrences[4] + occurrences[5],
  };
}

function calculateSquares(innerSquare) {
  return {
    character: innerSquare[0],
    energy: innerSquare[1],
    interest: innerSquare[2],
    health: innerSquare[3],
    logics: innerSquare[4],
    work: innerSquare[5],
    luck: innerSquare[6],
    debt: innerSquare[7],
    memory: innerSquare[8],
  };
}

function shareToWhatsApp(result) {
  try {
    const text = encodeURIComponent(
      `Здравствуйте! Мне нужна ваша консультация по психоматрице. Вот результат расчета:\n${result}`
    );
    const whatsappURL = `https://wa.me/?text=${text}`;
    window.open(whatsappURL, "_blank");
  } catch (error) {
    console.error("Error sharing to WhatsApp:", error);
    alert("Не удалось поделиться в WhatsApp");
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    const copyBtn = document.getElementById("copyBtn");

    // Визуальная обратная связь
    const originalColor = copyBtn.style.backgroundColor;
    copyBtn.style.backgroundColor = "#28a745";

    setTimeout(() => {
      copyBtn.style.backgroundColor = originalColor;
    }, 1000);
  } catch (err) {
    console.error("Failed to copy text: ", err);
    alert("Не удалось скопировать текст");
  }
}
