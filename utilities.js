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
    // Try different date formats
    const formats = [
        // ISO format: 2022-01-15
        /^\d{4}-\d{2}-\d{2}/,
        // US format: 01/15/2022
        /^\d{1,2}\/\d{1,2}\/\d{4}/,
        // Month Day, Year: January 15, 2022
        /^[A-Za-z]+\s+\d{1,2},\s+\d{4}/
    ];
    
    const date = new Date(dateString);
    
    // Check if date is valid
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
    
    // Map common variations
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

// Normalize breed names
function normalizeBreed(breed) {
    if (!breed) return '';
    
    // Capitalize first letter of each word
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

// Debounce function for search/filter inputs
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

// Generate a random color (for future use in additional visualizations)
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Get color palette for visualizations
function getColorPalette(type = 'default') {
    const palettes = {
        default: ['#5B9BD5', '#E06666', '#F4B183', '#9B59B6', '#6DD5C3'],
        dogs: ['#5B9BD5', '#4472C4', '#2E5C8A', '#1F4E78', '#17375E'],
        cats: ['#E06666', '#C55A5A', '#A94E4E', '#8E4242', '#723636'],
        breeds: ['#F4B183', '#E09B6F', '#CC855B', '#B86F47', '#A45933'],
        mixed: ['#9B59B6', '#6DD5C3']
    };
    
    return palettes[type] || palettes.default;
}

// Download data as JSON
function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Download data as CSV
function downloadCSV(data, filename) {
    // Convert array of objects to CSV
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show loading spinner
function showLoadingSpinner(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
    }
}

// Hide loading spinner
function hideLoadingSpinner(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

// Show error message
function showErrorMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Validate ZIP code (US format)
function isValidZipCode(zip) {
    // Basic US ZIP code validation (5 digits or 5+4 format)
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

// Calculate percentage change
function calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
}

// Sort array of objects by key
function sortByKey(array, key, ascending = true) {
    return array.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
    });
}

// Group array by key
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

// Calculate average of array
function average(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

// Calculate median of array
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
