document.addEventListener("DOMContentLoaded", () => {
  const expressionEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");

  let currentExpression = "";
  let lastResult = 0;

  let isShiftActive = false;
  let isAlphaActive = false;

  const shiftIndicator = document.getElementById("shift-indicator");
  const alphaIndicator = document.getElementById("alpha-indicator");

  const memory = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 };

  const updateDisplay = () => {
    expressionEl.innerText = currentExpression;
  };

  const toggleShift = () => {
    isShiftActive = !isShiftActive;
    if (shiftIndicator)
      shiftIndicator.style.visibility = isShiftActive ? "visible" : "hidden";
    if (isShiftActive && isAlphaActive) toggleAlpha();
  };

  const toggleAlpha = () => {
    isAlphaActive = !isAlphaActive;
    if (alphaIndicator)
      alphaIndicator.style.visibility = isAlphaActive ? "visible" : "hidden";
    if (isAlphaActive && isShiftActive) toggleShift();
  };

  const appendToExpression = (val) => {
    currentExpression += val;
    updateDisplay();
    if (isShiftActive) toggleShift();
    if (isAlphaActive) toggleAlpha();
  };

  const clearAll = () => {
    currentExpression = "";
    resultEl.innerText = "0";
    updateDisplay();
  };

  const deleteLast = () => {
    if (currentExpression.length > 0) {
      currentExpression = currentExpression.slice(0, -1);
      updateDisplay();
    }
  };

  const calculateResult = () => {
    if (!currentExpression) return;

    try {
      let evalExpr = currentExpression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/Ans/g, "lastResult")
        .replace(/sin⁻¹\(/g, "asin(")
        .replace(/cos⁻¹\(/g, "acos(")
        .replace(/tan⁻¹\(/g, "atan(")
        .replace(/√\(/g, "sqrt(")
        .replace(/log\(/g, "log10(")
        .replace(/ln\(/g, "log(")
        .replace(/π/g, "pi");

      evalExpr = evalExpr.replace(/(sin|cos|tan)\(([^)]+)\)/g, "$1($2 deg)");

      let openParens = (evalExpr.match(/\(/g) || []).length;
      let closeParens = (evalExpr.match(/\)/g) || []).length;
      while (openParens > closeParens) {
        evalExpr += ")";
        closeParens++;
      }

      const scope = {
        lastResult: lastResult,
        A: memory.A,
        B: memory.B,
        C: memory.C,
        D: memory.D,
        E: memory.E,
        F: memory.F,
        X: memory.X,
        Y: memory.Y,
        M: memory.M,
      };

      let result = math.evaluate(evalExpr, scope);

      if (!Number.isInteger(result) && typeof result === "number") {
        result = parseFloat(result.toPrecision(12));
      }

      resultEl.innerText = result;
      lastResult = result;
    } catch (error) {
      console.error(error);
      resultEl.innerText = "Syntax Error";
    }
  };

  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-val");
      const action = btn.getAttribute("data-action");

      if (action) {
        switch (action) {
          case "ac":
            clearAll();
            break;
          case "del":
            deleteLast();
            break;
          case "calc":
            calculateResult();
            break;
          case "ans":
            appendToExpression("Ans");
            break;
          case "shift":
            toggleShift();
            break;
          case "alpha":
            toggleAlpha();
            break;
        }
      } else if (val) {
        let actualVal = val;
        if (isShiftActive) {
          if (val === "sin(") actualVal = "sin⁻¹(";
          else if (val === "cos(") actualVal = "cos⁻¹(";
          else if (val === "tan(") actualVal = "tan⁻¹(";
          else if (val === "×10^") actualVal = "π";
          else if (val === "log(") actualVal = "10^";
          else if (val === "ln(") actualVal = "e^";
          else if (val === "√(") actualVal = "³√(";
          else if (val === "^-1") actualVal = "x!";
        } else if (isAlphaActive) {
          if (val === "-") actualVal = "A";
          else if (val === "°") actualVal = "B";
          else if (val === "hyp") actualVal = "C";
          else if (val === "sin(") actualVal = "D";
          else if (val === "cos(") actualVal = "E";
          else if (val === "tan(") actualVal = "F";
          else if (val === ")") actualVal = "X";
          else if (val === "S<=>D") actualVal = "Y";
          else if (val === "M+") actualVal = "M";
        }
        appendToExpression(actualVal);
      }
    });
  });
});
