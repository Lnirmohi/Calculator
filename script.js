const currentDisplay = document.getElementById("current"),
    mainDisplay = document.getElementById("main");

//to disable operator keys if pressed once
var isOperatorEnabled = false,
    history = {
        equation: "",
        answer: ""
    };

attachHandlerToButtons();

function attachHandlerToButtons() {

    window.addEventListener("keydown", handleNumPadEvent);

    [...document.getElementsByClassName("num-button")].forEach(btn => btn.addEventListener("click", handleNumberEvent));
    [...document.getElementsByClassName("op-button")].forEach(btn => btn.addEventListener("click", handleOperatorEvent));
    [...document.getElementsByClassName("edit-button")].forEach(btn => btn.addEventListener("click", handleEditEvent));
}

function handleNumPadEvent(numPadEvent) {

    console.log(numPadEvent);

    if (/[0-9|\.]/g.test(numPadEvent.key)) {

        updateCurrentDisplay(numPadEvent.key);
    } else if (/[\+\-|*\=]/g.test(numPadEvent.key) || numPadEvent.key == "Enter") {

        operationalUpdate(numPadEvent.key);
    } else if (numPadEvent.key == "Backspace") {

        deletionUpdate();
    }
}

function handleNumberEvent(numberEvent) {

    updateCurrentDisplay(numberEvent.srcElement.textContent);
}

function numericUpdate(value) {

    if (currentDisplay.textContent.length <= 22) {

        updateCurrentDisplay(value);
    }
}

//this function handles operator events like +, -, *, /, =
function handleOperatorEvent(operatorEvent) {

    //to clear the screen if a division by zero has taken place and current display
    //shows "Cannot divide by zero".
    operationalUpdate(operatorEvent.srcElement.textContent);
}

function operationalUpdate(operator) {

    if (/[a-zA-Z]/g.test(currentDisplay.textContent)) {

        resetBothDisplay();
    } else if ((operator == "=" || operator == "Enter") && isOperatorEnabled == false) {

        mainDisplay.textContent += currentDisplay.textContent;

        currentDisplay.textContent = evaluateExp(mainDisplay.textContent).toString();

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

        //to clear the screen if a division by zero has taken place and current display
        //shows "Cannot divide by zero".
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

    if (isOperatorEnabled == false || (mainDisplay.textContent == "" && operator !== "=")) {

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