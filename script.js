// Unit Conversion Calculator JavaScript Core Functions

// Global variables
let currentTab = 'length';
let currentInput = null;

// History arrays
let lengthHistory = [];
let weightHistory = [];

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeInputs();
    
    // Initialize history display
    updateHistoryDisplay('length');
    updateHistoryDisplay('weight');
    
    // Use preview function for initial display (without adding to history)
    previewLength();
    previewWeight();
});

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // Remove all active states
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active state
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    currentTab = tabId;
    updateCurrentInput();
}

function initializeInputs() {
    // Remove input event listeners, use preview functions instead
    const lengthInput = document.getElementById('length-input');
    const weightInput = document.getElementById('weight-input');
    
    if (lengthInput) lengthInput.addEventListener('input', previewLength);
    if (weightInput) weightInput.addEventListener('input', previewWeight);
}

function updateCurrentInput() {
    currentInput = document.getElementById(`${currentTab}-input`);
}

// Virtual keyboard functionality
function insertText(text) {
    if (!currentInput) updateCurrentInput();
    
    const start = currentInput.selectionStart;
    const end = currentInput.selectionEnd;
    const currentValue = currentInput.value;
    
    // Insert text at cursor position
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    currentInput.value = newValue;
    
    // Move cursor to after inserted text
    const newCursorPos = start + text.length;
    currentInput.setSelectionRange(newCursorPos, newCursorPos);
    currentInput.focus();
}

function insertWeightText(text) {
    const weightInput = document.getElementById('weight-input');
    
    const start = weightInput.selectionStart;
    const end = weightInput.selectionEnd;
    const currentValue = weightInput.value;
    
    // Insert text at cursor position
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    weightInput.value = newValue;
    
    // Move cursor to after inserted text
    const newCursorPos = start + text.length;
    weightInput.setSelectionRange(newCursorPos, newCursorPos);
    weightInput.focus();
}

function clearInput() {
    if (currentTab === 'length') {
        document.getElementById('length-input').value = '';
        previewLength();
    } else if (currentTab === 'weight') {
        document.getElementById('weight-input').value = '';
        previewWeight();
    }
}

function clearWeightInput() {
    document.getElementById('weight-input').value = '';
    previewWeight();
}

// Backspace functions for inputs
function backspaceInput() {
    const el = document.getElementById('length-input');
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) {
        if (start > 0) {
            el.value = el.value.slice(0, start - 1) + el.value.slice(end);
            const pos = start - 1;
            el.setSelectionRange(pos, pos);
        }
    } else {
        el.value = el.value.slice(0, start) + el.value.slice(end);
        el.setSelectionRange(start, start);
    }
    el.focus();
    previewLength();
}

function backspaceWeightInput() {
    const el = document.getElementById('weight-input');
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) {
        if (start > 0) {
            el.value = el.value.slice(0, start - 1) + el.value.slice(end);
            const pos = start - 1;
            el.setSelectionRange(pos, pos);
        }
    } else {
        el.value = el.value.slice(0, start) + el.value.slice(end);
        el.setSelectionRange(start, start);
    }
    el.focus();
    previewWeight();
}

// Length unit converter
class LengthConverter {
    constructor() {
        // All units converted to inches ratio
        this.units = {
            'FT': 12,      // 1 foot = 12 inches
            'IN': 1,       // 1 inch = 1 inch
            'M': 39.3701,  // 1 meter = 39.3701 inches
            'CM': 0.393701, // 1 centimeter = 0.393701 inches
            'MM': 0.0393701, // 1 millimeter = 0.0393701 inches
            'YD': 36,      // 1 yard = 36 inches
            'KM': 39370.1, // 1 kilometer = 39370.1 inches
            'MI': 63360    // 1 mile = 63360 inches
        };
    }

    // Parse input expression
    parseExpression(input) {
        try {
            // Clean input
            let expression = input.trim().toUpperCase();
            
            // Handle feet-inches format (like 4'3", 4' 3 7/8")
            expression = this.parseFeetInches(expression);
            
            // Handle fractions
            expression = this.parseFractions(expression);
            
            // Handle units
            expression = this.parseUnits(expression);
            
            // Calculate expression
            const result = this.evaluateExpression(expression);
            return result;
        } catch (error) {
            throw new Error('Invalid input expression');
        }
    }

    // Parse feet-inches format
    parseFeetInches(expression) {
        // Match 4'3" or 4' 3 7/8" format
        const feetInchesRegex = /(\d+(?:\.\d+)?)\s*'\s*(?:(\d+(?:\s+\d+\/\d+)?(?:\.\d+)?)\s*"?)?/g;
        
        return expression.replace(feetInchesRegex, (match, feet, inches) => {
            let totalInches = parseFloat(feet) * 12;
            if (inches) {
                // Handle fractions in inches part
                const fractionMatch = inches.match(/(\d+)\s+(\d+)\/(\d+)/);
                if (fractionMatch) {
                    totalInches += parseInt(fractionMatch[1]) + parseInt(fractionMatch[2]) / parseInt(fractionMatch[3]);
                } else {
                    totalInches += parseFloat(inches);
                }
            }
            return totalInches.toString();
        });
    }

    // Parse fractions
    parseFractions(expression) {
        const fractionRegex = /(\d+)\/(\d+)/g;
        return expression.replace(fractionRegex, (match, numerator, denominator) => {
            return this.evaluateFraction(match);
        });
    }

    // Calculate fraction value
    evaluateFraction(fraction) {
        const [numerator, denominator] = fraction.split('/').map(Number);
        return (numerator / denominator).toString();
    }

    // Parse units
    parseUnits(expression) {
        // Replace units with corresponding inch values
        for (const [unit, ratio] of Object.entries(this.units)) {
            const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${unit}`, 'g');
            expression = expression.replace(regex, (match, number) => {
                return (parseFloat(number) * ratio).toString();
            });
        }
        return expression;
    }

    // Calculate mathematical expression
    evaluateExpression(expression) {
        // Remove all non-numeric, operator, decimal point and space characters
        const cleanExpression = expression.replace(/[^0-9+\-*/.() ]/g, '');
        
        try {
            // Use Function constructor to safely calculate expression
            const result = Function('"use strict"; return (' + cleanExpression + ')')();
            return result;
        } catch (error) {
            throw new Error('Invalid mathematical expression');
        }
    }

    // Convert inches to various units
    convertFromInches(inches) {
        return {
            feet: inches / 12,
            inches: inches,
            meters: inches / 39.3701,
            centimeters: inches / 0.393701,
            millimeters: inches / 0.0393701
        };
    }

    // Format as feet and inches
    formatFeetInches(inches) {
        const feet = Math.floor(inches / 12);
        const remainingInches = inches % 12;
        
        if (feet === 0) {
            // Only inches, convert to fraction format
            const fractionInches = this.toFraction(remainingInches);
            return `${fractionInches}"`;
        } else {
            // Feet and inches, convert inches part to fraction format
            const fractionInches = this.toFraction(remainingInches);
            return `${feet}' ${fractionInches}"`;
        }
    }

    // Convert to closest fraction
    toFraction(decimal) {
        if (decimal === 0) return '0';
        
        const wholePart = Math.floor(decimal);
        const fractionalPart = decimal - wholePart;
        
        if (fractionalPart === 0) return wholePart.toString();
        
        // Common fraction denominators: 2, 4, 8, 16
        const denominators = [2, 4, 8, 16];
        let bestNumerator = 0;
        let bestDenominator = 1;
        let bestError = Math.abs(fractionalPart);
        
        for (const denominator of denominators) {
            const numerator = Math.round(fractionalPart * denominator);
            if (numerator === 0) continue; // Skip 0 fractions
            
            const fractionValue = numerator / denominator;
            const error = Math.abs(fractionalPart - fractionValue);
            
            if (error < bestError) {
                bestNumerator = numerator;
                bestDenominator = denominator;
                bestError = error;
            }
            
            if (error < 0.001) break; // Close enough, stop
        }
        
        // If fraction equals 1, add to whole part
        if (bestNumerator === bestDenominator) {
            return (wholePart + 1).toString();
        }
        
        // Simplify fraction
        const gcd = this.greatestCommonDivisor(bestNumerator, bestDenominator);
        bestNumerator /= gcd;
        bestDenominator /= gcd;
        
        if (wholePart === 0) {
            return `${bestNumerator}/${bestDenominator}`;
        } else {
            return `${wholePart} ${bestNumerator}/${bestDenominator}`;
        }
    }

    // Calculate greatest common divisor
    greatestCommonDivisor(a, b) {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }
}

// Weight unit converter
class WeightConverter {
    constructor() {
        // All units converted to grams ratio
        this.units = {
            'LB': 453.592,    // 1 pound = 453.592 grams
            'OZ': 28.3495,    // 1 ounce = 28.3495 grams
            'KG': 1000,       // 1 kilogram = 1000 grams
            'G': 1,           // 1 gram = 1 gram
            'TON': 1000000,   // 1 ton = 1000000 grams
            'ST': 6350.29,    // 1 stone = 6350.29 grams
            'CT': 0.2         // 1 carat = 0.2 grams
        };
    }

    // Parse input expression
    parseExpression(input) {
        try {
            let expression = input.trim().toUpperCase();
            
            // Handle pounds-ounces format (like 5 lb 8 oz)
            expression = this.parsePoundsOunces(expression);
            
            // Handle units
            expression = this.parseUnits(expression);
            
            // Calculate expression
            const result = this.evaluateExpression(expression);
            return result;
        } catch (error) {
            throw new Error('Invalid input expression');
        }
    }

    // Parse pounds-ounces format
    parsePoundsOunces(expression) {
        const poundsOuncesRegex = /(\d+(?:\.\d+)?)\s*LB\s*(\d+(?:\.\d+)?)\s*OZ/g;
        
        return expression.replace(poundsOuncesRegex, (match, pounds, ounces) => {
            const totalGrams = parseFloat(pounds) * 453.592 + parseFloat(ounces) * 28.3495;
            return totalGrams.toString();
        });
    }

    // Parse units
    parseUnits(expression) {
        for (const [unit, ratio] of Object.entries(this.units)) {
            const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${unit}`, 'g');
            expression = expression.replace(regex, (match, number) => {
                return (parseFloat(number) * ratio).toString();
            });
        }
        return expression;
    }

    // Calculate mathematical expression
    evaluateExpression(expression) {
        const cleanExpression = expression.replace(/[^0-9+\-*/.() ]/g, '');
        
        try {
            const result = Function('"use strict"; return (' + cleanExpression + ')')();
            return result;
        } catch (error) {
            throw new Error('Invalid mathematical expression');
        }
    }

    // Convert grams to various units
    convertFromGrams(grams) {
        return {
            pounds: grams / 453.592,
            ounces: grams / 28.3495,
            kilograms: grams / 1000,
            grams: grams
        };
    }

    // Format as pounds and ounces
    formatPoundsOunces(grams) {
        const pounds = Math.floor(grams / 453.592);
        const remainingGrams = grams % 453.592;
        const ounces = remainingGrams / 28.3495;
        
        if (pounds === 0) {
            return `${ounces.toFixed(3)} oz`;
        } else {
            return `${pounds} lb ${ounces.toFixed(3)} oz`;
        }
    }
}

// Create converter instances
const lengthConverter = new LengthConverter();
const weightConverter = new WeightConverter();

// Length preview function (real-time update, no history recording)
function previewLength() {
    const inputElement = document.getElementById('length-input');
    if (!inputElement) return; // Exit if element doesn't exist
    
    const input = inputElement.value;
    
    // Do nothing when input is empty, keep last calculation result
    if (!input.trim()) return;
    
    // Remove real-time calculation and result updates
    // User input does not update main result display area
    // Only execute full calculation when equals button is clicked
}

// Length calculation function (called when equals button is clicked, records history)
function calculateLength() {
    const input = document.getElementById('length-input').value;
    
    if (!input.trim()) return;
    
    try {
        const inches = lengthConverter.parseExpression(input);
        const conversions = lengthConverter.convertFromInches(inches);
        
        // Update display (align with current HTML IDs and fraction format)
        document.getElementById('length-result-display').textContent = lengthConverter.formatFeetInches(inches);
        document.getElementById('inches-fraction').textContent = lengthConverter.toFraction(conversions.inches) + '"';
        document.getElementById('inches-decimal').textContent = conversions.inches.toFixed(3);
        document.getElementById('feet-inches').textContent = lengthConverter.formatFeetInches(inches);
        document.getElementById('millimeters').textContent = conversions.millimeters.toFixed(1);
        document.getElementById('centimeters').textContent = conversions.centimeters.toFixed(2);
        document.getElementById('meters').textContent = conversions.meters.toFixed(4);
        
        // Only add to history after successful calculation
        addToHistory('length', input, lengthConverter.formatFeetInches(inches));
        
    } catch (error) {
        console.error('Length calculation error:', error);
    }
}

// Weight preview function (real-time update, no history recording)
function previewWeight() {
    const inputElement = document.getElementById('weight-input');
    if (!inputElement) return; // Exit if element doesn't exist
    
    const input = inputElement.value;
    
    // Do nothing when input is empty, keep last calculation result
    if (!input.trim()) return;
    
    // Remove real-time calculation and result updates
    // User input does not update main result display area
    // Only execute full calculation when equals button is clicked
}

// Weight calculation function (called when equals button is clicked, records history)
function calculateWeight() {
    const input = document.getElementById('weight-input').value;
    
    if (!input.trim()) return;
    
    try {
        const grams = weightConverter.parseExpression(input);
        const conversions = weightConverter.convertFromGrams(grams);
        
        // Update display (align with current HTML IDs)
        document.getElementById('weight-result-display').textContent = weightConverter.formatPoundsOunces(grams);
        document.getElementById('total-pounds').textContent = conversions.pounds.toFixed(3);
        document.getElementById('total-ounces').textContent = conversions.ounces.toFixed(2);
        document.getElementById('kilograms').textContent = conversions.kilograms.toFixed(4);
        document.getElementById('grams').textContent = conversions.grams.toFixed(2);
        
        // Only add to history after successful calculation
        addToHistory('weight', input, weightConverter.formatPoundsOunces(grams));
        
    } catch (error) {
        console.error('Weight calculation error:', error);
    }
}

// History management functions
function addToHistory(type, equation, result) {
    const historyArray = type === 'length' ? lengthHistory : weightHistory;
    
    // Add new record to beginning of array
    historyArray.unshift({ equation, result });
    
    // Keep only recent 2 records
    if (historyArray.length > 2) {
        historyArray.splice(2);
    }
    
    // Update display
    updateHistoryDisplay(type);
}

function updateHistoryDisplay(type) {
    const historyArray = type === 'length' ? lengthHistory : weightHistory;
    const historyList = document.getElementById(`${type}-history-content`);
    
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    historyArray.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-equation">${item.equation}</div>
            <div class="history-result">${item.result}</div>
        `;
        historyList.appendChild(historyItem);
    });
}

// Keyboard event support
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        if (currentTab === 'length') {
            calculateLength();
        } else if (currentTab === 'weight') {
            calculateWeight();
        }
    }
});

// History panel collapse/expand functionality
function toggleHistory(type) {
    const tab = document.getElementById(`${type}-tab`);
    if (!tab) return;
    const content = tab.querySelector('.history-content');
    const toggleButton = tab.querySelector('.history-toggle');
    if (!content || !toggleButton) return;

    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? 'block' : 'none';
    toggleButton.textContent = isHidden ? '▼' : '▶';
}

// Ensure inline onclick handlers can access functions in global scope
// This is a no-op in non-module scripts but guarantees availability.
window.insertText = insertText;
window.insertWeightText = insertWeightText;
window.clearInput = clearInput;
window.clearWeightInput = clearWeightInput;
window.backspaceInput = backspaceInput;
window.backspaceWeightInput = backspaceWeightInput;
window.calculateLength = calculateLength;
window.calculateWeight = calculateWeight;
window.toggleHistory = toggleHistory;