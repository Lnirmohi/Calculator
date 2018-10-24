const buttons = [...document.getElementsByClassName("btn")],
      currentDisplay = document.getElementById("current"),
      mainDisplay = document.getElementById("main");

let isOperatorCalled = false,
    expressionStack = [];

buttons.forEach( btn => 
    btn.addEventListener("click", handleEvent)
);

function handleEvent(e) {
    //console.log(e.srcElement.textContent);
    
    if(/\d/.test(e.srcElement.dataset.value)){

        updateCurrentDisplay(e.srcElement.textContent);
    }else if(e.srcElement.classList[1] == "op-button" && currentDisplay.textContent.length !== 0){

        updateMainDisplay(currentDisplay.textContent, e.srcElement.textContent);

        isOperatorCalled = true;
    }else if(e.srcElement.id == "clear"){

        currentDisplay.textContent = mainDisplay.textContent = "";
    }else if(e.srcElement.id == "delete"){

        currentDisplay.textContent = currentDisplay.textContent.slice(0, -1);

        isOperatorCalled = true;

        updateCurrentDisplay(currentDisplay.textContent);
    }else if(e.srcElement.id == "equals"){

        if(isOperatorCalled == false){

            mainDisplay.textContent += currentDisplay.textContent;

            expressionStack = decidePrecedence(mainDisplay.textContent);
            //console.log(mainDisplay.textContent);

            isOperatorCalled = true;
        }   
    }
}

function updateCurrentDisplay(currentValue) {

    if(isOperatorCalled == true){

        currentDisplay.textContent = "";

        isOperatorCalled = false;
    }

    currentDisplay.textContent += currentValue;
}

function updateMainDisplay(currentValue, operator) {
    
    if(isOperatorCalled == false){

        mainDisplay.textContent += `${currentValue}${operator}`;
    }
}

function arithmetic() {

    let answer = 0;
    
    if(operator == "+"){

        answer = a+b;
    }else if(operator == "-"){

        answer = a-b;
    }else if(operator == "*"){

        answer = a*b;
    }else if(operator == "/"){

        answer = a/b;
    }

    return answer;
}

function decidePrecedence(expString){
    
}