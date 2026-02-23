// app.js - Main application logic for Pet License Explorer

// Global (at the top so it's available everwhere in the file) 
// variable to store parsed data
let petData = [];
let zipLookup = {};
// just like petData holds all the CSV rows so any function 
// can access them, zipLookup will hold the pre-processed zip code
// table so the search funcation can reach it

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Get references to key DOM elements
    const demoButton = document.getElementById('demo-button');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const tryAgainButton = document.getElementById('try-again-button');
    const demoDataButton = document.getElementById('demo-data-button');
    const zipSearchButton = document.getElementById('zip-search-button');
    
    // Set up event listeners
    if (demoButton) {
        demoButton.addEventListener('click', loadSeattleData);
    }
    
    if (uploadArea) {
        // Handle click to trigger file input
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // Handle drag and drop
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (tryAgainButton) {
        tryAgainButton.addEventListener('click', resetToLanding);
    }
    
    if (demoDataButton) {
        demoDataButton.addEventListener('click', loadSeattleData);
    }

    if (zipSearchButton) {
    zipSearchButton.addEventListener('click', handleZipSearch);
    }
}

const zipInput = document.getElementById('zip-input');
if (zipInput) {
    zipInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            handleZipSearch();
        }
    });
}

// Load Seattle demo data
function loadSeattleData() {
    showLoadingScreen();
    
    // Fetch the Seattle pet license CSV from your data folder
    fetch('data/seattle-pet-licenses.csv')
        .then(response => response.text())
        .then(csvText => {
            parseCSV(csvText);
        })
        .catch(error => {
            console.error('Error loading Seattle data:', error);
            showErrorScreen('Could not load demo data. Please try uploading your own CSV.');
        });
}

// Handle drag over event
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

// Handle file drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// Handle file selection from input
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// Process the uploaded file
function processFile(file) {
    // Check if it's a CSV file
    if (!file.name.endsWith('.csv')) {
        showErrorScreen('Please upload a .csv file');
        return;
    }
    
    showLoadingScreen();
    
    // Read the file
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvText = e.target.result;
        parseCSV(csvText);
    };
    reader.onerror = function() {
        showErrorScreen('Could not read file. Please try again.');
    };
    reader.readAsText(file);
}

// Parse CSV using PapaParse
function parseCSV(csvText) {
    Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            validateAndProcessData(results.data);
        },
        error: function(error) {
            console.error('Parse error:', error);
            showErrorScreen('Could not parse CSV. Please check your file format.');
        }
    });
}

// Validate that required columns are present
function validateAndProcessData(data) {
    const requiredColumns = [
        'License Issue Date',
        'Animal\'s Name',
        'Species',
        'Primary Breed',
        'Secondary Breed',
        'ZIP Code'
    ];
    
    if (data.length === 0) {
        showErrorScreen('CSV file is empty');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
        showErrorScreen(
            `Missing required columns: ${missingColumns.join(', ')}<br>` +
            'Check column names match exactly (spelling and capitalization matter)'
        );
        return;
    }
    
    // Store the data globally
    petData = data;
    zipLookup = buildZipLookup(petData);
    // right after CSV is parsed and stored,
    // process it into a zip lookup table
    // this way, the lookup is built and ready
    // once the loading screen finishes
    
    // Simulate processing time (remove in production if you want instant results)
    setTimeout(() => {
        showVisualizationsPage();
    }, 1500);
}

// Show/hide different screens
function showLoadingScreen() {
    hideAllScreens();
    document.getElementById('loading-screen').style.display = 'block';
    
    // Animate progress bar (optional)
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        progressBar.style.width = '0%';
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 100);
    }
}

function showErrorScreen(message) {
    hideAllScreens();
    const errorScreen = document.getElementById('error-screen');
    errorScreen.style.display = 'block';
    
    // Update error message if provided
    if (message) {
        const errorMessage = errorScreen.querySelector('.error-details');
        if (errorMessage) {
            errorMessage.innerHTML = message;
        }
    }
}

function showVisualizationsPage() {
    hideAllScreens();
    document.getElementById('visualizations-screen').style.display = 'block';
    
    // Generate all visualizations
    generateVisualizations();
    
    // Generate story ideas
    generateStoryIdeas();
}

function resetToLanding() {
    hideAllScreens();
    document.getElementById('landing-screen').style.display = 'block';
    
    // Clear any stored data
    petData = [];
}

function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.display = 'none';
    });
}

// Export data for use in other modules
function getPetData() {
    return petData;
}

function handleZipSearch() {
  const input = document.getElementById('zip-input');
  const zip = input.value.trim();
  if (!isValidZipCode(zip)) {
    document.getElementById('zip-results').innerHTML = '<p class="zip-error">Please enter a valid 5-digit ZIP code.</p>';
    return;
  }
  const summary = getZipSummary(zipLookup, zip);
  if (!summary) {
    document.getElementById('zip-results').innerHTML = '<p class="zip-error">No data found for ZIP code ' + zip + '.</p>';
    return;
  }
  displayZipResults(summary);
  
  fetchDemographicData(zip).then(demographics => {
    displayDemographicData(demographics, zip);
});
}

function displayZipResults(summary) {
    const resultsDiv = document.getElementById('zip-results');
    
    resultsDiv.innerHTML = `
        <div id="zip-results-card">
            <h3>ZIP code ${summary.zip}</h3>
            <p>${summary.total.toLocaleString()} total licensed pets</p>
            <p>${summary.dogs.toLocaleString()} dogs (${summary.dogPercent}%) · ${summary.cats.toLocaleString()} cats (${summary.catPercent}%)</p>
            <p>Top dog breeds: ${summary.topBreeds.map(b => b.name).join(' · ')}</p>
        </div>
    `;
}

function displayDemographicData(demographics, zip) {
  const card = document.getElementById('zip-results-card');
  if (!card) return;
  
  const section = document.createElement('div');
  section.id = 'demographic-data';
  
  if (!demographics || !demographics.Count_Person) {
    section.innerHTML = `
      <hr>
      <p class="source-credit">Community context unavailable for this ZIP code.</p>
    `;
    card.appendChild(section);
    return;
  }
  
  let details = `<p>Population: ${demographics.Count_Person.value.toLocaleString()}</p>`;
  
  if (demographics.Median_Income_Person) {
    details += `<p>Median income: $${demographics.Median_Income_Person.value.toLocaleString()}</p>`;
  }
  if (demographics.Median_Age_Person) {
    details += `<p>Median age: ${demographics.Median_Age_Person.value} years</p>`;
  }
  
  section.innerHTML = `
    <hr>
    <p><strong>Community context</strong> (${demographics.Count_Person.date} Census)</p>
    ${details}
    <p class="source-credit">Source: <a href="https://datacommons.org/place/zip/${zip}" target="_blank">Data Commons</a> (U.S. Census Bureau)</p>
  `;
  card.appendChild(section);
}