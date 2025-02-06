class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateHistory();
    }

    initializeElements() {
        this.currentOperandElement = document.getElementById('currentOperand');
        this.previousOperandElement = document.getElementById('previousOperand');
        this.historyDisplayElement = document.getElementById('historyDisplay');
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
    }

    setupEventListeners() {
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => this.appendNumber(button.dataset.number));
        });

        document.querySelectorAll('[data-operator]').forEach(button => {
            button.addEventListener('click', () => this.chooseOperation(button.dataset.operator));
        });

        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                switch (button.dataset.action) {
                    case 'clear':
                        this.clear();
                        break;
                    case 'delete':
                        this.delete();
                        break;
                    case 'calculate':
                        this.calculate();
                        break;
                    case 'percentage':
                        this.percentage();
                        break;
                    case 'plusMinus':
                        this.plusMinus();
                        break;
                }
            });
        });

        document.getElementById('historyToggle').addEventListener('click', () => {
            this.historyPanel.classList.toggle('active');
        });

        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9' || e.key === '.') this.appendNumber(e.key);
            if (e.key === '+') this.chooseOperation('add');
            if (e.key === '-') this.chooseOperation('subtract');
            if (e.key === '*') this.chooseOperation('multiply');
            if (e.key === '/') this.chooseOperation('divide');
            if (e.key === 'Enter') this.calculate();
            if (e.key === 'Escape') this.clear();
            if (e.key === 'Backspace') this.delete();
            if (e.key === '%') this.percentage();
        });
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.calculate();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.updateDisplay();
    }

    calculate() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case 'add':
                computation = prev + current;
                break;
            case 'subtract':
                computation = prev - current;
                break;
            case 'multiply':
                computation = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    alert('No se puede dividir por cero');
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Add to history
        const expression = `${prev} ${this.getOperationSymbol(this.operation)} ${current}`;
        this.addToHistory(expression, computation);

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.updateDisplay();
    }

    percentage() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current / 100).toString();
        this.updateDisplay();
    }

    plusMinus() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current * -1).toString();
        this.updateDisplay();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }

    getOperationSymbol(operation) {
        const symbols = {
            add: '+',
            subtract: '-',
            multiply: '×',
            divide: '÷'
        };
        return symbols[operation] || '';
    }

    addToHistory(expression, result) {
        const historyItem = {
            expression,
            result: result.toString(),
            timestamp: new Date().toISOString()
        };
        this.history.unshift(historyItem);
        if (this.history.length > 10) this.history.pop();
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        this.updateHistory();
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('calculatorHistory');
        this.updateHistory();
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.formatNumber(this.currentOperand);
        if (this.operation) {
            this.previousOperandElement.textContent = 
                `${this.formatNumber(this.previousOperand)} ${this.getOperationSymbol(this.operation)}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    updateHistory() {
        this.historyList.innerHTML = '';
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-expression">${item.expression} =</div>
                <div class="history-result">${this.formatNumber(item.result)}</div>
            `;
            historyItem.addEventListener('click', () => {
                this.currentOperand = item.result;
                this.updateDisplay();
            });
            this.historyList.appendChild(historyItem);
        });
    }

    formatNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '0';
        } else {
            integerDisplay = integerDigits.toLocaleString('es', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }
}

// Initialize calculator
const calculator = new Calculator();
