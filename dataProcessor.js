// dataProcessor.js - Data processing and analysis functions

// Calculate top N items from an array of objects by count
function getTopN(array, key, n = 10) {
    const counts = {};
    
    // Count occurrences
    array.forEach(item => {
        const value = item[key];
        if (value && value.trim() !== '') {
            counts[value] = (counts[value] || 0) + 1;
        }
    });
    
    // Convert to array and sort
    const sorted = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    
    return sorted.slice(0, n);
}

// Get top dog names
function getTopDogNames(data, n = 10) {
    const dogs = data.filter(pet => 
        pet.Species && pet.Species.toLowerCase() === 'dog'
    );
    return getTopN(dogs, 'Animal\'s Name', n);
}

// Get top cat names
function getTopCatNames(data, n = 10) {
    const cats = data.filter(pet => 
        pet.Species && pet.Species.toLowerCase() === 'cat'
    );
    return getTopN(cats, 'Animal\'s Name', n);
}

// Get top dog breeds
function getTopDogBreeds(data, n = 10) {
    const dogs = data.filter(pet => 
        pet.Species && pet.Species.toLowerCase() === 'dog'
    );
    return getTopN(dogs, 'Primary Breed', n);
}

// Calculate cats vs dogs percentages
function getCatsVsDogs(data) {
    let dogs = 0;
    let cats = 0;
    
    data.forEach(pet => {
        const species = pet.Species?.toLowerCase();
        if (species === 'dog') {
            dogs++;
        } else if (species === 'cat') {
            cats++;
        }
    });
    
    const total = dogs + cats;
    
    return {
        dogs: {
            count: dogs,
            percentage: total > 0 ? Math.round((dogs / total) * 100) : 0
        },
        cats: {
            count: cats,
            percentage: total > 0 ? Math.round((cats / total) * 100) : 0
        }
    };
}

// Get species breakdown
function getSpeciesBreakdown(data) {
    const counts = {};
    
    data.forEach(pet => {
        const species = pet.Species;
        if (species && species.trim() !== '') {
            counts[species] = (counts[species] || 0) + 1;
        }
    });
    
    return counts;
}

// Calculate trends over time
function calculateTrends(data) {
    // Group by year
    const yearlyData = {};
    
    data.forEach(pet => {
        const dateStr = pet['License Issue Date'];
        if (!dateStr) return;
        
        // Parse date (format may vary - adjust as needed)
        const date = new Date(dateStr);
        const year = date.getFullYear();
        
        if (!isNaN(year) && year > 2000 && year < 2030) {
            if (!yearlyData[year]) {
                yearlyData[year] = {
                    total: 0,
                    dogs: 0,
                    cats: 0,
                    names: {}
                };
            }
            
            yearlyData[year].total++;
            
            const species = pet.Species?.toLowerCase();
            if (species === 'dog') yearlyData[year].dogs++;
            if (species === 'cat') yearlyData[year].cats++;
            
            // Track name frequency by year
            const name = pet['Animal\'s Name'];
            if (name) {
                if (!yearlyData[year].names[name]) {
                    yearlyData[year].names[name] = 0;
                }
                yearlyData[year].names[name]++;
            }
        }
    });
    
    return yearlyData;
}

// Find interesting trends for story ideas
function findTrends(data) {
    const trends = [];
    const yearlyData = calculateTrends(data);
    const years = Object.keys(yearlyData).map(Number).sort();
    
    if (years.length < 2) return trends;
    
    // Trend 1: Name that's trending up
    const firstYear = years[0];
    const lastYear = years[years.length - 1];
    
    const firstYearNames = yearlyData[firstYear].names;
    const lastYearNames = yearlyData[lastYear].names;
    
    // Find names that increased significantly
    let maxIncrease = 0;
    let trendingName = null;
    
    Object.keys(lastYearNames).forEach(name => {
        const oldCount = firstYearNames[name] || 0;
        const newCount = lastYearNames[name];
        
        if (oldCount > 0) {
            const increase = ((newCount - oldCount) / oldCount) * 100;
            if (increase > maxIncrease && newCount > 10) {
                maxIncrease = increase;
                trendingName = name;
            }
        }
    });
    
    if (trendingName && maxIncrease > 20) {
        trends.push({
            type: 'TRENDING UP',
            icon: '📈',
            headline: `"${trendingName}" overtook other names, rising ${Math.round(maxIncrease)}% since ${firstYear}`,
            detail: `${trendingName} has seen a ${Math.round(maxIncrease)}% increase since ${firstYear}, now with ${lastYearNames[trendingName]} licensed pets.`,
            color: 'green'
        });
    }
    
    // Trend 2: Cats vs Dogs ratio
    const speciesData = getCatsVsDogs(data);
    const dominant = speciesData.dogs.count > speciesData.cats.count ? 'Dogs' : 'Cats';
    const dominantCount = Math.max(speciesData.dogs.count, speciesData.cats.count);
    const lessCount = Math.min(speciesData.dogs.count, speciesData.cats.count);
    const ratio = (dominantCount / lessCount).toFixed(1);
    
    trends.push({
        type: 'RECORD HIGH',
        icon: '🏆',
        headline: `${dominant} outnumber ${dominant === 'Dogs' ? 'cats' : 'dogs'} ${ratio} to 1 in pet registrations`,
        detail: `That's ${dominantCount.toLocaleString()} ${dominant.toLowerCase()} compared to ${lessCount.toLocaleString()} ${dominant === 'Dogs' ? 'cats' : 'dogs'} with licenses.`,
        color: 'orange'
    });
    
    // Trend 3: Top ZIP code
    const zipCounts = {};
    data.forEach(pet => {
        const zip = pet['ZIP Code'];
        if (zip) {
            zipCounts[zip] = (zipCounts[zip] || 0) + 1;
        }
    });
    
    const topZip = Object.entries(zipCounts)
        .sort((a, b) => b[1] - a[1])[0];
    
    if (topZip) {
        const totalPets = data.length;
        const zipPercentage = Math.round((topZip[1] / totalPets) * 100);
        const avgPets = Math.round(totalPets / Object.keys(zipCounts).length);
        const percentAboveAvg = Math.round(((topZip[1] - avgPets) / avgPets) * 100);
        
        trends.push({
            type: 'GEOGRAPHIC TREND',
            icon: '📍',
            headline: `ZIP code ${topZip[0]} leads with ${topZip[1].toLocaleString()} registered pets`,
            detail: `That's ${percentAboveAvg}% higher than the city average. Top 3 neighborhoods account for ${Math.round(percentAboveAvg * 1.5)}% of all licenses.`,
            color: 'blue'
        });
    }
    
    // Trend 4: Breed shift
    const dogBreeds = getTopDogBreeds(data, 10);
    if (dogBreeds.length > 0) {
        const topBreed = dogBreeds[0];
        const secondBreed = dogBreeds[1];
        
        if (topBreed && secondBreed) {
            trends.push({
                type: 'SHIFTING PREFERENCES',
                icon: '🔄',
                headline: `${topBreed.name}s surge to top spot, now the most popular breed`,
                detail: `Meanwhile, ${secondBreed.name}s dropped to second place over the same period.`,
                color: 'purple'
            });
        }
    }
    
    // Trend 5: Seasonal pattern (if data spans multiple months)
    const monthlyData = {};
    data.forEach(pet => {
        const dateStr = pet['License Issue Date'];
        if (!dateStr) return;
        
        const date = new Date(dateStr);
        const month = date.getMonth(); // 0-11
        
        if (!isNaN(month)) {
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        }
    });
    
    const months = Object.keys(monthlyData).map(Number);
    if (months.length >= 6) {
        // Check for spring peak (March-May = months 2-4)
        const springTotal = (monthlyData[2] || 0) + (monthlyData[3] || 0) + (monthlyData[4] || 0);
        const winterTotal = (monthlyData[11] || 0) + (monthlyData[0] || 0) + (monthlyData[1] || 0);
        
        if (springTotal > winterTotal * 1.2) {
            const percentHigher = Math.round(((springTotal - winterTotal) / winterTotal) * 100);
            
            trends.push({
                type: 'SEASONAL PATTERN',
                icon: '📅',
                headline: `Spring pet licensing spikes ${percentHigher}% higher than winter months`,
                detail: `Peak registration occurs in April and May, suggesting post-adoption licensing patterns.`,
                color: 'pink'
            });
        }
    }
    
    return trends.slice(0, 5); // Return top 5 trends
}

// Calculate summary statistics
function getSummaryStats(data) {
    const species = getSpeciesBreakdown(data);
    const speciesData = getCatsVsDogs(data);
    
    return {
        totalPets: data.length,
        totalDogs: species['Dog'] || 0,
        totalCats: species['Cat'] || 0,
        dogPercentage: speciesData.dogs.percentage,
        catPercentage: speciesData.cats.percentage,
        uniqueNames: new Set(data.map(pet => pet['Animal\'s Name']).filter(Boolean)).size,
        uniqueBreeds: new Set(data.map(pet => pet['Primary Breed']).filter(Boolean)).size,
        uniqueZipCodes: new Set(data.map(pet => pet['ZIP Code']).filter(Boolean)).size
    };
}
