// 判斷是否為運算符
function isOperator(c) {
    return c === '+' || c === '-' || c === '*' || c === '/' || c === '%';
}

// 獲取運算符的優先級
function precedence(c) {
    if (c === '+' || c === '-') return 1;
    if (c === '*' || c === '/' || c === '%') return 2;
    return 0;
}

// 將 infix 表達式轉換為 tokens
function tokenize(infix) {
    const tokens = [];
    let i = 0;
    
    while (i < infix.length) {
        if (/\s/.test(infix[i])) {
            i++;
            continue;
        }
        
        if (/\d/.test(infix[i])) {
            let val = '';
            while (i < infix.length && /\d/.test(infix[i])) {
                val += infix[i];
                i++;
            }
            tokens.push({ type: 'number', value: val });
        } else if (isOperator(infix[i]) || infix[i] === '(' || infix[i] === ')') {
            tokens.push({ type: 'operator', value: infix[i] });
            i++;
        } else {
            i++; // 跳過未知字符
        }
    }
    
    return tokens;
}

function check(value1, value2, rev){
  if(rev == 0)
    return (precedence(value1) >= precedence(value2));
  else 
    return (precedence(value1) > precedence(value2));
}

// 轉換為 postfix 的步驟記錄
function infixToPostfixSteps(tokens, rev) {
    const steps = [];
    const stack = [];
    const output = [];
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        if (token.type === 'number') {
            steps.push({
                action: 'read',
                token: token,
                stack: [...stack],
                output: [...output],
                explanation: `讀取數字 ${token.value}，直接加入輸出`
            });
            
            output.push(token);
            
            steps.push({
                action: 'output',
                token: token,
                stack: [...stack],
                output: [...output],
                explanation: `將數字 ${token.value} 加入輸出`
            });
        } else if (token.value === '(') {
            steps.push({
                action: 'read',
                token: token,
                stack: [...stack],
                output: [...output],
                explanation: `讀取左括號 '('，放入堆疊`
            });
            
            stack.push(token);
            
            steps.push({
                action: 'push',
                token: token,
                stack: [...stack],
                output: [...output],
                explanation: `將左括號 '(' 放入堆疊`
            });
        } else if (token.value === ')') {
            steps.push({
                action: 'read',
                token: token,
                stack: [...stack],
                output: [...output],
                explanation: `讀取右括號 ')'，開始彈出堆疊直到找到對應的左括號`
            });
            
            while (stack.length > 0 && stack[stack.length - 1].value !== '(') {
                const popped = stack.pop();
                output.push(popped);
                
                steps.push({
                    action: 'pop',
                    token: popped,
                    stack: [...stack],
                    output: [...output],
                    explanation: `彈出運算符 '${popped.value}' 並加入輸出`
                });
            }
            
            if (stack.length > 0 && stack[stack.length - 1].value === '(') {
                const leftParen = stack.pop();
                
                steps.push({
                    action: 'pop',
                    token: leftParen,
                    stack: [...stack],
                    output: [...output],
                    explanation: `彈出左括號 '(' 並丟棄它`
                });
            }
        } else if (isOperator(token.value)) {
            steps.push({
                action: 'read',
                token: token,
                stack: [...stack],
                output: [...output],
                explanation: `讀取運算符 '${token.value}'`
            });
            
            while (
                stack.length > 0 &&
                stack[stack.length - 1].value !== '(' &&
                check(stack[stack.length-1].value, token.value, rev)
            ) {
                const popped = stack.pop();
                output.push(popped);
                
                steps.push({
                    action: 'pop',
                    token: popped,
                    stack: [...stack],
                    output: [...output],
                    explanation: `彈出優先級更高或相同的運算符 '${popped.value}' 並加入輸出`
                });
            }
            
            stack.push(token);
            
            steps.push({
                action: 'push',
                token: token,
                stack: [...stack],
                output: [...output],
                explanation: `將運算符 '${token.value}' 放入堆疊`
            });
        }
    }
    
    while (stack.length > 0) {
        const popped = stack.pop();
        output.push(popped);
        
        steps.push({
            action: 'pop',
            token: popped,
            stack: [...stack],
            output: [...output],
            explanation: `彈出剩餘的運算符 '${popped.value}' 並加入輸出`
        });
    }
    
    steps.push({
        action: 'complete',
        stack: [],
        output: [...output],
        explanation: `轉換完成！`
    });
    
    return { steps, output };
}

// 轉換為 prefix 的步驟記錄
function infixToPrefixSteps(infix) {
    // 先 tokenize
    const tokens = tokenize(infix);

    // 反轉 tokens 並交換括號
    const reversedTokens = tokens.reverse().map(token => {
        if (token.value === '(') {
            return { ...token, value: ')' };
        } else if (token.value === ')') {
            return { ...token, value: '(' };
        } else {
            return token;
        }
    });

    // 用 postfix algorithm 套用在 reversed tokens
    const { steps: postfixSteps, output: postfixOutput } = infixToPostfixSteps(reversedTokens, 1);

    const prefixSteps = [
        {
            action: 'init',
            explanation: `首先，我們反轉 token 並交換括號`
        },
        ...postfixSteps,
        {
            action: 'reverse',
            output: [...postfixOutput].reverse(),
            explanation: `最後，我們反轉 postfix 輸出來獲得 prefix 表達式`
        }
    ];

    return {
        steps: prefixSteps,
        output: [...postfixOutput].reverse()
    };
}


// 計算 postfix 表達式的值
function evaluatePostfix(postfixTokens) {
    const stack = [];
    
    for (const token of postfixTokens) {
        if (token.type === 'number') {
            stack.push(parseInt(token.value));
        } else if (isOperator(token.value)) {
            const n2 = stack.pop();
            const n1 = stack.pop();
            let result;
            
            switch (token.value) {
                case '+': result = n1 + n2; break;
                case '-': result = n1 - n2; break;
                case '*': result = n1 * n2; break;
                case '/': result = Math.floor(n1 / n2); break;
                case '%': result = n1 % n2; break;
            }
            
            stack.push(result);
        }
    }
    
    return stack[0];
}

// 將 token 數組轉換為字符串
function tokensToString(tokens) {
    return tokens.map(token => token.value).join(' ');
}

// 全局變量
let currentSteps = [];
let currentStepIndex = 0;
let animationInterval = null;

// DOM 元素
const infixInput = document.getElementById('infixInput');
const prefixBtn = document.getElementById('prefixBtn');
const postfixBtn = document.getElementById('postfixBtn');
const prevStepBtn = document.getElementById('prevStepBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');
const stackContainer = document.getElementById('stackContainer');
const outputContainer = document.getElementById('outputContainer');
const outputDisplay = document.getElementById('outputDisplay');
const explanationBox = document.getElementById('explanationBox');
const inputDisplay = document.getElementById('inputDisplay');
const prefixResult = document.getElementById('prefixResult');
const postfixResult = document.getElementById('postfixResult');
const evaluationResult = document.getElementById('evaluationResult');

// 顯示步驟
function displayStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= currentSteps.length) {
        return;
    }
    
    const step = currentSteps[stepIndex];
    
    // 更新說明
    explanationBox.textContent = step.explanation;
    
    // 清空堆疊和輸出容器
    stackContainer.innerHTML = '';
    outputContainer.innerHTML = '';
    
    // 顯示堆疊
    if (step.stack) {
        step.stack.forEach((token, index) => {
            const stackItem = document.createElement('div');
            stackItem.className = 'stack-item';
            stackItem.textContent = token.value;
            stackContainer.appendChild(stackItem);
            
            // 如果是新壓入的項目，添加動畫
            if (step.action === 'push' && index === step.stack.length - 1 && token.value === step.token.value) {
                stackItem.classList.add('pushed');
            }
        });
    }
    
    // 顯示輸出
    if (step.output) {
        step.output.forEach((token, index) => {
            const outputItem = document.createElement('div');
            outputItem.className = 'output-item';
            outputItem.textContent = token.value;
            outputContainer.appendChild(outputItem);
            
            // 讓輸出項目逐漸淡入
            setTimeout(() => {
                outputItem.style.opacity = '1';
            }, index * 100);
        });
    }
    
    // 如果是彈出操作，顯示動畫
    if (step.action === 'pop' && step.token) {
        const poppedItem = document.createElement('div');
        poppedItem.className = 'stack-item popped';
        poppedItem.textContent = step.token.value;
        poppedItem.style.position = 'absolute';
        poppedItem.style.bottom = '50%';
        stackContainer.appendChild(poppedItem);
        
        // 5秒後移除彈出項目
        setTimeout(() => {
            poppedItem.remove();
        }, 500);
    }
    
    // 如果轉換完成，顯示最終結果
    if (step.action === 'complete' || step.action === 'reverse') {
        outputDisplay.textContent = tokensToString(step.output);
    }
    
    // 更新按鈕狀態
    prevStepBtn.disabled = stepIndex === 0;
    nextStepBtn.disabled = stepIndex === currentSteps.length - 1;
}

// 前進一步
function nextStep() {
    if (currentStepIndex < currentSteps.length - 1) {
        currentStepIndex++;
        displayStep(currentStepIndex);
    } else {
        // 如果已經是最後一步，停止自動播放
        stopAnimation();
    }
}

// 後退一步
function prevStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        displayStep(currentStepIndex);
    }
}

// 開始自動播放
function startAnimation() {
    stopAnimation(); // 先停止之前的動畫
    playBtn.textContent = '暫停';
    animationInterval = setInterval(() => {
        if (currentStepIndex < currentSteps.length - 1) {
            nextStep();
        } else {
            stopAnimation();
        }
    }, 1000);
}

// 停止自動播放
function stopAnimation() {
    clearInterval(animationInterval);
    animationInterval = null;  // <- 加上這一行！
    playBtn.textContent = '自動播放';
}


// 重置可視化和所有輸入/輸出
function resetVisualization() {
    // 停止動畫
    stopAnimation();
    
    // 確保播放按鈕顯示為「自動播放」
    playBtn.textContent = '自動播放';
    
    // 清空輸入框
    infixInput.value = '';
    
    // 清空結果顯示
    prefixResult.textContent = '-';
    postfixResult.textContent = '-';
    evaluationResult.textContent = '-';
    
    // 清空輸入顯示
    inputDisplay.innerHTML = '';
    
    // 清空可視化區域
    stackContainer.innerHTML = '';
    outputContainer.innerHTML = '';
    outputDisplay.textContent = '';
    
    // 重置說明和步驟
    explanationBox.textContent = '請輸入一個 infix 表達式並選擇要轉換為 prefix 或 postfix。';
    currentSteps = [];
    currentStepIndex = 0;
    
    // 禁用步驟按鈕
    prevStepBtn.disabled = true;
    nextStepBtn.disabled = true;
}

// 處理轉換為 postfix
function handlePostfixConversion() {
    const infix = infixInput.value.trim();
    if (!infix) {
        alert('請輸入 infix 表達式');
        return;
    }
    
    inputDisplay.innerHTML = `Infix: ${infix}`;
    
    const tokens = tokenize(infix);
    const { steps, output } = infixToPostfixSteps(tokens, 0);
    
    currentSteps = steps;
    currentStepIndex = 0;
    
    // 計算並顯示結果
    const postfixStr = tokensToString(output);
    postfixResult.textContent = postfixStr;
    
    try {
        const value = evaluatePostfix(output);
        evaluationResult.textContent = value;
    } catch (err) {
        evaluationResult.textContent = '計算錯誤';
    }
    
    // 計算並顯示 prefix 結果
    const { output: prefixOutput } = infixToPrefixSteps(infix);
    prefixResult.textContent = tokensToString(prefixOutput);
    
    // 重置到第一步並顯示
    currentStepIndex = 0;
    displayStep(currentStepIndex);
}

// 處理轉換為 prefix
function handlePrefixConversion() {
    const infix = infixInput.value.trim();
    if (!infix) {
        alert('請輸入 infix 表達式');
        return;
    }
    
    inputDisplay.innerHTML = `Infix: ${infix}`;
    
    const { steps, output } = infixToPrefixSteps(infix);
    
    currentSteps = steps;
    currentStepIndex = 0;
    
    // 計算並顯示結果
    const prefixStr = tokensToString(output);
    prefixResult.textContent = prefixStr;
    
    // 計算並顯示 postfix 結果
    const tokens = tokenize(infix);
    const { output: postfixOutput } = infixToPostfixSteps(tokens, 0);
    postfixResult.textContent = tokensToString(postfixOutput);
    
    try {
        const value = evaluatePostfix(postfixOutput);
        evaluationResult.textContent = value;
    } catch (err) {
        evaluationResult.textContent = '計算錯誤';
    }
    
    // 重置到第一步並顯示
    currentStepIndex = 0;
    displayStep(currentStepIndex);
}

// 事件監聽器
prefixBtn.addEventListener('click', handlePrefixConversion);
postfixBtn.addEventListener('click', handlePostfixConversion);
prevStepBtn.addEventListener('click', prevStep);
nextStepBtn.addEventListener('click', nextStep);
playBtn.addEventListener('click', () => {
    if (animationInterval) {
        stopAnimation();
    } else {
        startAnimation();
    }
});
resetBtn.addEventListener('click', resetVisualization);

// 初始化頁面
prevStepBtn.disabled = true;
nextStepBtn.disabled = true;
