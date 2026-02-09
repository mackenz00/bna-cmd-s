// visualizations.js - Generate Vega-Lite visualizations

// Generate all visualizations on the page
function generateVisualizations() {
    const data = getPetData();
    
    if (!data || data.length === 0) {
        console.error('No data available for visualizations');
        return;
    }
    
    // Generate each visualization
    generateTopDogNames(data);
    generateTopCatNames(data);
    generateTopDogBreeds(data);
    generateCatsVsDogs(data);
}

// Generate Top 10 Dog Names bar chart
function generateTopDogNames(data) {
    const topNames = getTopDogNames(data, 10);
    
    const spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 400,
        height: 300,
        data: {
            values: topNames
        },
        mark: {
            type: 'bar',
            color: '#5B9BD5'
        },
        encoding: {
            y: {
                field: 'name',
                type: 'nominal',
                sort: '-x',
                axis: { title: null }
            },
            x: {
                field: 'count',
                type: 'quantitative',
                axis: { title: 'Number of Dogs' }
            },
            tooltip: [
                { field: 'name', type: 'nominal', title: 'Name' },
                { field: 'count', type: 'quantitative', title: 'Count' }
            ]
        }
    };
    
    vegaEmbed('#dog-names-chart', spec, { actions: false })
        .then(result => {
            setupDownloadButton('dog-names-download', result.view, 'top-10-dog-names.svg');
        })
        .catch(console.error);
}

// Generate Top 10 Cat Names bar chart
function generateTopCatNames(data) {
    const topNames = getTopCatNames(data, 10);
    
    const spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 400,
        height: 300,
        data: {
            values: topNames
        },
        mark: {
            type: 'bar',
            color: '#E06666'
        },
        encoding: {
            y: {
                field: 'name',
                type: 'nominal',
                sort: '-x',
                axis: { title: null }
            },
            x: {
                field: 'count',
                type: 'quantitative',
                axis: { title: 'Number of Cats' }
            },
            tooltip: [
                { field: 'name', type: 'nominal', title: 'Name' },
                { field: 'count', type: 'quantitative', title: 'Count' }
            ]
        }
    };
    
    vegaEmbed('#cat-names-chart', spec, { actions: false })
        .then(result => {
            setupDownloadButton('cat-names-download', result.view, 'top-10-cat-names.svg');
        })
        .catch(console.error);
}

// Generate Top 10 Dog Breeds bar chart
function generateTopDogBreeds(data) {
    const topBreeds = getTopDogBreeds(data, 10);
    
    const spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 400,
        height: 300,
        data: {
            values: topBreeds
        },
        mark: {
            type: 'bar',
            color: '#F4B183'
        },
        encoding: {
            y: {
                field: 'name',
                type: 'nominal',
                sort: '-x',
                axis: { title: null }
            },
            x: {
                field: 'count',
                type: 'quantitative',
                axis: { title: 'Number of Dogs' }
            },
            tooltip: [
                { field: 'name', type: 'nominal', title: 'Breed' },
                { field: 'count', type: 'quantitative', title: 'Count' }
            ]
        }
    };
    
    vegaEmbed('#dog-breeds-chart', spec, { actions: false })
        .then(result => {
            setupDownloadButton('dog-breeds-download', result.view, 'top-10-dog-breeds.svg');
        })
        .catch(console.error);
}

// Generate Cats vs Dogs donut chart
function generateCatsVsDogs(data) {
    const speciesData = getCatsVsDogs(data);
    
    const chartData = [
        { category: 'Dogs', count: speciesData.dogs.count, percentage: speciesData.dogs.percentage },
        { category: 'Cats', count: speciesData.cats.count, percentage: speciesData.cats.percentage }
    ];
    
    const spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 300,
        height: 300,
        data: {
            values: chartData
        },
        mark: {
            type: 'arc',
            innerRadius: 80,
            outerRadius: 120
        },
        encoding: {
            theta: {
                field: 'count',
                type: 'quantitative'
            },
            color: {
                field: 'category',
                type: 'nominal',
                scale: {
                    domain: ['Dogs', 'Cats'],
                    range: ['#5B9BD5', '#E06666']
                },
                legend: { title: null }
            },
            tooltip: [
                { field: 'category', type: 'nominal', title: 'Species' },
                { field: 'count', type: 'quantitative', title: 'Count', format: ',' },
                { field: 'percentage', type: 'quantitative', title: 'Percentage', format: '.0f' }
            ]
        }
    };
    
    vegaEmbed('#cats-dogs-chart', spec, { actions: false })
        .then(result => {
            setupDownloadButton('cats-dogs-download', result.view, 'cats-vs-dogs.svg');
            
            // Update text display if you have percentage displays
            const dogsPercentage = document.getElementById('dogs-percentage');
            const catsPercentage = document.getElementById('cats-percentage');
            if (dogsPercentage) dogsPercentage.textContent = `${speciesData.dogs.percentage}%`;
            if (catsPercentage) catsPercentage.textContent = `${speciesData.cats.percentage}%`;
        })
        .catch(console.error);
}

// Set up download button for SVG export
function setupDownloadButton(buttonId, view, filename) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    button.addEventListener('click', function() {
        view.toSVG()
            .then(svg => {
                // Create blob and download
                const blob = new Blob([svg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error downloading SVG:', error);
                alert('Could not download visualization. Please try again.');
            });
    });
}

// Generate story ideas based on data trends
function generateStoryIdeas() {
    const data = getPetData();
    const trends = findTrends(data);
    
    const container = document.getElementById('story-ideas-container');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create a card for each trend
    trends.forEach(trend => {
        const card = createStoryCard(trend);
        container.appendChild(card);
    });
}

// Create a story idea card element
function createStoryCard(trend) {
    const card = document.createElement('div');
    card.className = `story-card story-${trend.color}`;
    
    card.innerHTML = `
        <div class="story-icon">${trend.icon}</div>
        <div class="story-content">
            <div class="story-type">${trend.type}</div>
            <h3 class="story-headline">${trend.headline}</h3>
            <p class="story-detail">${trend.detail}</p>
        </div>
        <button class="copy-button" onclick="copyStoryHeadline(this, '${escapeHtml(trend.headline)}')">
            Copy
        </button>
    `;
    
    return card;
}

// Copy story headline to clipboard
function copyStoryHeadline(button, headline) {
    navigator.clipboard.writeText(headline)
        .then(() => {
            // Visual feedback
            const originalText = button.textContent;
            button.textContent = '✓ Copied';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        })
        .catch(err => {
            console.error('Could not copy text:', err);
            alert('Could not copy to clipboard');
        });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
