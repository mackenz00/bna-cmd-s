// utilities.js - Helper functions and utilities

// Format numbers with commas
function formatNumber(num) {
    return num.toLocaleString();
}

// Format percentage
function formatPercentage(num, decimals = 0) {
    return `${num.toFixed(decimals)}%`;
}

// Parse date string to Date object (handles various formats)
function parseDate(dateString) {
    const date = new Date(dateString);
    
    if (!isNaN(date.getTime())) {
        return date;
    }
    
    return null;
}

// Get year from date string
function getYear(dateString) {
    const date = parseDate(dateString);
    return date ? date.getFullYear() : null;
}

// Get month from date string (0-11)
function getMonth(dateString) {
    const date = parseDate(dateString);
    return date ? date.getMonth() : null;
}

// Clean text (trim whitespace, handle empty values)
function cleanText(text) {
    if (!text) return '';
    return text.trim();
}

// Normalize species names (handle variations in capitalization)
function normalizeSpecies(species) {
    if (!species) return '';
    
    const normalized = species.toLowerCase().trim();
    
    const speciesMap = {
        'dog': 'Dog',
        'dogs': 'Dog',
        'cat': 'Cat',
        'cats': 'Cat',
        'canine': 'Dog',
        'feline': 'Cat'
    };
    
    return speciesMap[normalized] || species;
}

// Normalize breed names (title case)
function normalizeBreed(breed) {
    if (!breed) return '';
    
    return breed
        .trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Check if a value is empty or null
function isEmpty(value) {
    return value === null || 
           value === undefined || 
           value === '' || 
           (typeof value === 'string' && value.trim() === '');
}

// Debounce function - useful for search inputs to avoid firing on every keystroke
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validate ZIP code (US format: 5 digits, or 5+4 format)
function isValidZipCode(zip) {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
}

// Get month name from month number (0-11)
function getMonthName(monthNumber) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber] || '';
}

// Calculate percentage change between two values
function calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
}

// Sort array of objects by a key
function sortByKey(array, key, ascending = true) {
    return array.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
    });
}

// Group array of objects by a key's value
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}

// Calculate average of an array of numbers
function average(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

// Calculate median of an array of numbers
function median(numbers) {
    if (numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
}

// Log to console with timestamp (for debugging)
function log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data || '');
}