const currentDisplay = document.getElementById("current"),
    mainDisplay = document.getElementById("main");

let isOperatorEnabled = false;

attachHandlerToButtons();

function attachHandlerToButtons() {
    
    [...document.getElementsByClassName("num-button")].forEach(btn => btn.addEventListener("click", handleNumberEvent));
    [...document.getElementsByClassName("op-button")].forEach(btn => btn.addEventListener("click", handleOperatorEvent));
    [...document.getElementsByClassName("edit-button")].forEach(btn => btn.addEventListener("click", handleEditEvent));
}

function handleNumberEvent(numberEvent) {

    updateCurrentDisplay(numberEvent.srcElement.textContent);

    if (isOperatorEnabled = false == true) {
        isOperatorEnabled = false;
    }
}

function handleOperatorEvent(operatorEvent) {

    if (operatorEvent.srcElement.id == "equals" && isOperatorEnabled == false) {

        mainDisplay.textContent += currentDisplay.textContent;

        currentDisplay.textContent = evaluateExp(mainDisplay.textContent).toString();

        mainDisplay.textContent = "";

        isOperatorEnabled = true;
    } else if (currentDisplay.textContent.length !== 0) {

        updateMainDisplay(currentDisplay.textContent, operatorEvent.srcElement.textContent);

        isOperatorEnabled = true;
    }
}

function handleEditEvent(editEvent) {

    if (editEvent.srcElement.id == "clear") {

        currentDisplay.textContent = mainDisplay.textContent = "";
    } else if (editEvent.srcElement.id == "delete") {

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

    currentDisplay.textContent += currentValue;
}

function updateMainDisplay(currentValue, operator) {

    if (isOperatorEnabled == false) {

        mainDisplay.textContent += `${currentValue}${operator}`;
    }
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

//It splits the digits by removing operator and returns an array
function getDigitsFromEqn(expression, operator) {

    return expression.split(`${operator}`)
        .filter(num => num != "")
        .map((num) => {
            return parseFloat(num)
        });
}