const currentDisplay = document.getElementById("current"),
    mainDisplay = document.getElementById("main");

//to disable operator keys if pressed once
var isOperatorEnabled = false,
    previousCalculations = [],
    showHistory = false;

attachHandlerToButtons();

function attachHandlerToButtons() {

    window.addEventListener("keydown", handleNumPadEvent);

    document.getElementById("negate").addEventListener("click", handleNegation);
    document.getElementById("clear-history").addEventListener("click", clearHistory);
    document.getElementById("toggle-history").addEventListener("click", toggleHistorySection);

    [...document.getElementsByClassName("num-button")].forEach(btn => btn.addEventListener("click", handleNumberEvent));
    [...document.getElementsByClassName("op-button")].forEach(btn => btn.addEventListener("click", handleOperatorEvent));
    [...document.getElementsByClassName("edit-button")].forEach(btn => btn.addEventListener("click", handleEditEvent));

}

function handleNegation() {

    let currentEqnLength = currentDisplay.textContent.length;

    if (currentEqnLength > 0) {

        if (!currentDisplay.textContent.startsWith("-")) {

            currentDisplay.textContent = "-".concat(currentDisplay.textContent);
        } else if (currentDisplay.textContent.startsWith("-")) {

            currentDisplay.textContent = currentDisplay.textContent.slice(1, currentEqnLength);
        }
    }
}

function handleNumPadEvent(numPadEvent) {

    if (/[0-9|\.]/g.test(numPadEvent.key)) {

        numericUpdate(numPadEvent.key);
    } else if ((/[\+\-\*\/\=]/.test(numPadEvent.key)) || numPadEvent.key == "Enter") {

        operationalUpdate(numPadEvent.key);
    } else if (numPadEvent.key == "Backspace") {

        deletionUpdate();
    }
}

function handleNumberEvent(numberEvent) {

    numericUpdate(numberEvent.srcElement.textContent);
}

function numericUpdate(value) {

    if (currentDisplay.textContent.length <= 22) {

        updateCurrentDisplay(value);
    }
}

//this function handles operator events like +, -, *, /, =
function handleOperatorEvent(operatorEvent) {

    operationalUpdate(operatorEvent.srcElement.textContent);
}

function operationalUpdate(operator) {

    //to clear the screen if a division by zero has taken place and current display
    //shows "Cannot divide by zero".
    if (/[a-zA-Z]/g.test(currentDisplay.textContent)) {

        resetBothDisplay();
    } else if ((operator == "=" || operator == "Enter") && isOperatorEnabled == false) {

        mainDisplay.textContent += currentDisplay.textContent;

        currentDisplay.textContent = evaluateExp(mainDisplay.textContent).toString();

        updateHistory(mainDisplay.textContent, currentDisplay.textContent);

        updateHistoryDiv();

        mainDisplay.textContent = "";

        isOperatorEnabled = true;
    } else if (currentDisplay.textContent.length !== 0) {

        updateMainDisplay(currentDisplay.textContent, operator);

        isOperatorEnabled = true;
    }
}

function handleEditEvent(editEvent) {

    if (editEvent.srcElement.id == "clear") {

        resetBothDisplay();
    } else if (editEvent.srcElement.id == "delete") {
        
        deletionUpdate();
    }
}

function deletionUpdate() {

    if (/[a-zA-Z]/g.test(currentDisplay.textContent)) {

        resetBothDisplay();
    } else {

        currentDisplay.textContent = currentDisplay.textContent.slice(0, -1);

        isOperatorEnabled = true;

        updateCurrentDisplay(currentDisplay.textContent);
    }
}

function updateCurrentDisplay(currentValue) {

    if (isOperatorEnabled == true) {

        currentDisplay.textContent = "";

        isOperatorEnabled = false;
    }

    if (currentValue == ".") {

        if (currentDisplay.textContent.includes(".") == false && currentDisplay.textContent.length !== 0) {

            currentDisplay.textContent += currentValue;
        }
    } else {

        currentDisplay.textContent += currentValue;
    }

}

function updateMainDisplay(currentValue, operator) {

    if (isOperatorEnabled == false || (mainDisplay.textContent == "" && operator !== "=" && operator !== "Enter")) {

        //if decimal is pressed and no number is followed by it then decimal is sliced out
        if (currentValue.endsWith(".")) {

            currentValue = currentValue.slice(0, currentValue.length - 1);
        }

        mainDisplay.textContent += `${currentValue}${operator}`;
    }
}

function resetBothDisplay() {

    currentDisplay.textContent = mainDisplay.textContent = "";
}

function arithmetic([a, b], operator) {

    let answer = 0;

    if (operator == "+") {

        answer = a + b;
    } else if (operator == "-") {

        answer = a - b;
    } else if (operator == "*") {

        answer = a * b;
    } else if (operator == "/") {

        answer = a / b;
    }

    return answer;
}

//This function splits the equation into multiple single expression and
//solves them by order of precedence of operators
function evaluateExp(expString) {

    if (checkForDivisionByZero(expString)) {

        return "Cannot divide by Zero";
    }

    let regexForOperation;

    expString = simplifyEquation(expString);

    if (expString.match(/\*|\//g) !== null) {

        regexForOperation = new RegExp("\\*|\\/", "g");

        expString = evaluateSingleExp(regexForOperation, expString);
    }

    if (expString.match(/\+|\-/g) !== null) {

        regexForOperation = new RegExp("\\+|\\-", "g");

        expString = evaluateSingleExp(regexForOperation, expString);
    }

    return parseFloat(expString);
}

function checkForDivisionByZero(exp) {

    if (exp.endsWith("/0") || /\/0[\+\-\*\/]/.test(exp)) {

        return true;
    }

    return false;
}

//It simplifies equation by equating plus/minus signs
function simplifyEquation(equation) {

    equation = equation.replace(/--/g, "+");
    equation = equation.replace(/(\+-)|(-\+)/g, "-");

    return equation;
}

//This function splits the equation with the operator, which leaves an array of two
//numbers which are then converted to floating values and sent to arithmetic function,
//which performs operation acording to operator and retruns result.
function evaluateSingleExp(regex, expression) {

    let regexForDigitSplitting;

    expression.match(regex).forEach(operator => {

        regexForDigitSplitting = new RegExp(`\\+?-?(\\w+(\\.\\w+)?)\\${operator}\\+?-?(\\w+(\\.\\w+)?)`);

        expression = expression.replace(regexForDigitSplitting, function ($1) {

            let digits = [],
                result = 0;

            digits = getDigitsFromEqn($1, operator);

            if (expression[0] == "-" && operator == "-") {
                digits[0] = -digits[0];
            }

            result = arithmetic(digits, operator);

            if (result >= 0) {
                return "+" + result;
            }

            return result;
        });
    });

    return expression;
}

//it splits the digits by removing operator and returns an array
function getDigitsFromEqn(expression, operator) {

    return expression.split(`${operator}`)
        .filter(num => num != "")
        .map((num) => {
            return parseFloat(num)
        });
}

function updateHistory(equation, answer) {

    previousCalculations.unshift({
        eqn: equation,
        sol: answer
    });
}

function updateHistoryDiv() {

    let historyPara = document.createElement("p"),
        hr = document.createElement("hr"),
        historySec = document.getElementById("history-section");

    historyPara.textContent = previousCalculations[0].eqn + " = " + previousCalculations[0].sol;

    historyPara.appendChild(hr);

    historySec.insertBefore(historyPara, historySec.firstChild);
}

function clearHistory() {

    previousCalculations = [];

    document.getElementById("history-section").innerHTML = "";
}

function toggleHistorySection() {

    let historyDiv = document.getElementById("history");

    historyDiv.style.transitionDuration = "1s";

    if (showHistory == false) {

        setTransitionsOnHistoryDiv(300, "0px 6px 50px 0px #00000033", true);
    } else if (showHistory == true) {

        setTransitionsOnHistoryDiv(0, "none", false);
    }

    function setTransitionsOnHistoryDiv(value, shadow, flag) {

        historyDiv.style.transform = "translate(" + value + "px)";

        historyDiv.style.boxShadow = shadow;

        showHistory = flag;
    }

}