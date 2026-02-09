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
        title: {
            text: 'Top 10 Dog Names',
            fontSize: 16,
            font: 'sans-serif',
            anchor: 'start'
        },
        width: 400,
        height: 350,
        padding: { top: 20, bottom: 60, left: 10, right: 10 },
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
                axis: { 
                    title: 'Dog Name',
                    labelFontSize: 11,
                    titleFontSize: 12
                }
            },
            x: {
                field: 'count',
                type: 'quantitative',
                axis: { 
                    title: 'Number of Dogs',
                    labelFontSize: 11,
                    titleFontSize: 12
                }
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
        title: {
            text: 'Top 10 Cat Names',
            fontSize: 16,
            font: 'sans-serif',
            anchor: 'start'
        },
        width: 400,
        height: 350,
        padding: { top: 20, bottom: 60, left: 10, right: 10 },
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
                axis: { 
                    title: 'Cat Name',
                    labelFontSize: 11,
                    titleFontSize: 12
                }
            },
            x: {
                field: 'count',
                type: 'quantitative',
                axis: { 
                    title: 'Number of Cats',
                    labelFontSize: 11,
                    titleFontSize: 12
                }
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
        title: {
            text: 'Top 10 Dog Breeds',
            fontSize: 16,
            font: 'sans-serif',
            anchor: 'start'
        },
        width: 400,
        height: 350,
        padding: { top: 20, bottom: 60, left: 10, right: 10 },
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
                axis: { 
                    title: 'Breed',
                    labelFontSize: 11,
                    titleFontSize: 12
                }
            },
            x: {
                field: 'count',
                type: 'quantitative',
                axis: { 
                    title: 'Number of Dogs',
                    labelFontSize: 11,
                    titleFontSize: 12
                }
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
        title: {
            text: 'Cats vs Dogs',
            fontSize: 16,
            font: 'sans-serif',
            anchor: 'start'
        },
        width: 350,
        height: 350,
        padding: { top: 20, bottom: 60, left: 10, right: 10 },
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
                    range: ['#3185fc', '#e84855']
                },
                legend: { 
                    title: 'Species',
                    titleFontSize: 12,
                    labelFontSize: 11
                }
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
        // Get the corresponding source input
        const sourceInputId = buttonId.replace('-download', '-source');
        const sourceInput = document.getElementById(sourceInputId);
        const dataSource = sourceInput ? sourceInput.value.trim() : '';
        
        view.toSVG()
            .then(svg => {
                // Add attribution text to SVG
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
                const svgElement = svgDoc.documentElement;
                
                // Get SVG dimensions
                const width = parseFloat(svgElement.getAttribute('width') || 500);
                const height = parseFloat(svgElement.getAttribute('height') || 400);
                
                // Increase SVG height to make room for attribution
                const newHeight = height + 30;
                svgElement.setAttribute('height', newHeight);
                svgElement.setAttribute('viewBox', `0 0 ${width} ${newHeight}`);
                
                // Create attribution text element
                const attribution = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
                attribution.setAttribute('x', width / 2);
                attribution.setAttribute('y', height + 20); // Position below the chart
                attribution.setAttribute('text-anchor', 'middle');
                attribution.setAttribute('font-family', 'sans-serif');
                attribution.setAttribute('font-size', '11');
                attribution.setAttribute('fill', '#666');
                
                // Set attribution text
                const sourceText = dataSource ? dataSource : 'Your Data Source';
                attribution.textContent = `Created with Pet License Explorer | ${sourceText}`;
                
                // Append to SVG
                svgElement.appendChild(attribution);
                
                // Serialize back to string
                const serializer = new XMLSerializer();
                const modifiedSvg = serializer.serializeToString(svgDoc);
                
                // Create blob and download
                const blob = new Blob([modifiedSvg], { type: 'image/svg+xml' });
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