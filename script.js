document.addEventListener('DOMContentLoaded', () => {
    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');
    
    let currentExpression = '';
    let lastResult = 0;
    
    const updateDisplay = () => {
        expressionEl.innerText = currentExpression;
    };

    const appendToExpression = (val) => {
        currentExpression += val;
        updateDisplay();
    };

    const clearAll = () => {
        currentExpression = '';
        resultEl.innerText = '0';
        updateDisplay();
    };

    const deleteLast = () => {
        if (currentExpression.length > 0) {
            // Check for multi-character functions to delete them as a whole if possible, 
            // but for simplicity, deleting one char is standard on basic calculators
            currentExpression = currentExpression.slice(0, -1);
            updateDisplay();
        }
    };

    const calculateResult = () => {
        if (!currentExpression) return;
        
        try {
            // Pre-process the expression for JS evaluation
            let evalExpr = currentExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/\^/g, '**')
                .replace(/Ans/g, lastResult);

            // Advanced functions replacements
            // Note: Order matters. Replace longer strings first if they overlap.
            evalExpr = evalExpr.replace(/sin\(/g, 'Math.sin((Math.PI/180)*');
            evalExpr = evalExpr.replace(/cos\(/g, 'Math.cos((Math.PI/180)*');
            evalExpr = evalExpr.replace(/tan\(/g, 'Math.tan((Math.PI/180)*');
            evalExpr = evalExpr.replace(/log\(/g, 'Math.log10(');
            evalExpr = evalExpr.replace(/ln\(/g, 'Math.log(');
            evalExpr = evalExpr.replace(/√\(/g, 'Math.sqrt(');
            
            // Auto-close parentheses
            let openParens = (evalExpr.match(/\(/g) || []).length;
            let closeParens = (evalExpr.match(/\)/g) || []).length;
            while (openParens > closeParens) {
                evalExpr += ')';
                closeParens++;
            }

            // Evaluate
            // Using Function is slightly safer and cleaner than direct eval
            const calculate = new Function('return ' + evalExpr);
            let result = calculate();

            // Handle precision issues (e.g. 0.1 + 0.2)
            if (!Number.isInteger(result)) {
                result = parseFloat(result.toPrecision(12)); 
            }

            // Update display and state
            resultEl.innerText = result;
            lastResult = result;
            
        } catch (error) {
            resultEl.innerText = 'Syntax Error';
        }
    };

    // Add event listeners to all buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-val');
            const action = btn.getAttribute('data-action');
            
            if (val) {
                appendToExpression(val);
            } else if (action) {
                switch(action) {
                    case 'ac':
                        clearAll();
                        break;
                    case 'del':
                        deleteLast();
                        break;
                    case 'calc':
                        calculateResult();
                        break;
                    case 'ans':
                        appendToExpression('Ans');
                        break;
                }
            }
        });
    });
});
