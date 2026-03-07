// dataProcessor.js - Data processing and analysis functions

// Calculate top N items from an array of objects by count
function getTopN(array, key, n = 10) {
    const counts = {};
    
    array.forEach(item => {
        const value = item[key];
        if (value && value.trim() !== '') {
            counts[value] = (counts[value] || 0) + 1;
        }
    });
    
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
// Uses .toLowerCase() throughout so it handles 'Dog', 'dog', 'DOG' etc.
function getCatsVsDogs(data) {
    let dogs = 0;
    let cats = 0;
    
    data.forEach(pet => {
        const species = pet.Species?.toLowerCase();
        if (species === 'dog') dogs++;
        else if (species === 'cat') cats++;
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

// Get species breakdown (normalized to title case for consistent keys)
function getSpeciesBreakdown(data) {
    const counts = {};
    
    data.forEach(pet => {
        const species = pet.Species;
        if (species && species.trim() !== '') {
            const normalized = species.trim().toLowerCase();
            const titleCase = normalized.charAt(0).toUpperCase() + normalized.slice(1);
            counts[titleCase] = (counts[titleCase] || 0) + 1;
        }
    });
    
    return counts;
}

// Calculate trends over time — groups data by year
function calculateTrends(data) {
    const yearlyData = {};
    
    data.forEach(pet => {
        const dateStr = pet['License Issue Date'];
        if (!dateStr) return;
        
        const date = new Date(dateStr);
        const year = date.getFullYear();
        
        if (!isNaN(year) && year > 2000 && year < 2030) {
            if (!yearlyData[year]) {
                yearlyData[year] = {
                    total: 0,
                    dogs: 0,
                    cats: 0,
                    names: {},
                    dogBreeds: {}
                };
            }
            
            yearlyData[year].total++;
            
            const species = pet.Species?.toLowerCase();
            if (species === 'dog') {
                yearlyData[year].dogs++;
                const breed = pet['Primary Breed']?.trim();
                if (breed) {
                    yearlyData[year].dogBreeds[breed] = (yearlyData[year].dogBreeds[breed] || 0) + 1;
                }
            }
            if (species === 'cat') yearlyData[year].cats++;
            
            const name = pet['Animal\'s Name'];
            if (name) {
                yearlyData[year].names[name] = (yearlyData[year].names[name] || 0) + 1;
            }
        }
    });
    
    return yearlyData;
}

// Find interesting trends for story ideas.
// Every statistic here is calculated from the actual data.
// If there isn't enough data to support a particular story, that card is skipped
// rather than inventing plausible-sounding numbers.
function findTrends(data) {
    const trends = [];
    const yearlyData = calculateTrends(data);
    const years = Object.keys(yearlyData).map(Number).sort();

    // ── Trend 1: Name trending up ───────────────────────────────────────────
    // Requires at least 2 years of data. Compares actual counts in first vs last year.
    if (years.length >= 2) {
        const firstYear = years[0];
        const lastYear = years[years.length - 1];
        const firstYearNames = yearlyData[firstYear].names;
        const lastYearNames = yearlyData[lastYear].names;
        
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
                headline: `"${trendingName}" is one of the fastest-rising pet names, up ${Math.round(maxIncrease)}% since ${firstYear}`,
                detail: `In ${firstYear} there were ${firstYearNames[trendingName]} licensed pets named ${trendingName}. By ${lastYear} that had grown to ${lastYearNames[trendingName]}.`,
                color: 'green'
            });
        }
    }

    // ── Trend 2: Cats vs dogs ratio ─────────────────────────────────────────
    // Straight count — always accurate.
    const speciesData = getCatsVsDogs(data);
    if (speciesData.dogs.count > 0 && speciesData.cats.count > 0) {
        const dominant = speciesData.dogs.count > speciesData.cats.count ? 'Dogs' : 'Cats';
        const dominantCount = Math.max(speciesData.dogs.count, speciesData.cats.count);
        const lessCount = Math.min(speciesData.dogs.count, speciesData.cats.count);
        const ratio = (dominantCount / lessCount).toFixed(1);
        
        trends.push({
            type: 'SPECIES BREAKDOWN',
            icon: '🏆',
            headline: `${dominant} outnumber ${dominant === 'Dogs' ? 'cats' : 'dogs'} ${ratio} to 1 in pet registrations`,
            detail: `The dataset contains ${dominantCount.toLocaleString()} licensed ${dominant.toLowerCase()} compared to ${lessCount.toLocaleString()} ${dominant === 'Dogs' ? 'cats' : 'dogs'}.`,
            color: 'orange'
        });
    }

    // ── Trend 3: Geographic concentration ──────────────────────────────────
    // Calculates the actual share of licenses held by the top 3 zip codes.
    const zipCounts = {};
    data.forEach(pet => {
        const zip = pet['ZIP Code']?.trim();
        if (zip) zipCounts[zip] = (zipCounts[zip] || 0) + 1;
    });
    
    const sortedZips = Object.entries(zipCounts).sort((a, b) => b[1] - a[1]);
    
    if (sortedZips.length > 0) {
        const totalPets = data.length;
        const topZip = sortedZips[0];
        const topZipPercent = Math.round((topZip[1] / totalPets) * 100);
        
        if (sortedZips.length >= 3) {
            const top3Count = sortedZips.slice(0, 3).reduce((sum, [, count]) => sum + count, 0);
            const top3Percent = Math.round((top3Count / totalPets) * 100);
            
            trends.push({
                type: 'GEOGRAPHIC TREND',
                icon: '📍',
                headline: `ZIP code ${topZip[0]} has the most registered pets at ${topZip[1].toLocaleString()} — ${topZipPercent}% of the dataset`,
                detail: `The top 3 ZIP codes (${sortedZips.slice(0, 3).map(z => z[0]).join(', ')}) together account for ${top3Percent}% of all ${totalPets.toLocaleString()} licenses.`,
                color: 'blue'
            });
        } else {
            trends.push({
                type: 'GEOGRAPHIC TREND',
                icon: '📍',
                headline: `ZIP code ${topZip[0]} leads with ${topZip[1].toLocaleString()} registered pets`,
                detail: `That's ${topZipPercent}% of all ${totalPets.toLocaleString()} licenses in the dataset.`,
                color: 'blue'
            });
        }
    }

    // ── Trend 4: Name diversity ─────────────────────────────────────────────
    // Counts unique dog names and compares to total dogs.
    // "One name for every X dogs" gives a sense of how creative/diverse owners are.
    const dogs = data.filter(pet => pet.Species?.toLowerCase() === 'dog');
    const uniqueDogNames = new Set(
        dogs.map(pet => pet['Animal\'s Name']?.trim()).filter(Boolean)
    );
    
    if (dogs.length > 0 && uniqueDogNames.size > 0) {
        const dogsPerName = (dogs.length / uniqueDogNames.size).toFixed(1);
        
        trends.push({
            type: 'NAME DIVERSITY',
            icon: '🐾',
            headline: `Seattle dog owners registered ${uniqueDogNames.size.toLocaleString()} unique names across ${dogs.length.toLocaleString()} licensed dogs`,
            detail: `That's roughly one unique name for every ${dogsPerName} dogs.`,
            color: 'purple'
        });
    }

    // ── Trend 5: Seasonal pattern ───────────────────────────────────────────
    // Compares actual monthly totals — no invented numbers.
    // Only shown if data spans at least 6 months.
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
    
    if (Object.keys(monthlyData).length >= 6) {
        const springTotal = (monthlyData[2] || 0) + (monthlyData[3] || 0) + (monthlyData[4] || 0);
        const winterTotal = (monthlyData[11] || 0) + (monthlyData[0] || 0) + (monthlyData[1] || 0);
        
        if (winterTotal > 0 && springTotal > winterTotal * 1.2) {
            const percentHigher = Math.round(((springTotal - winterTotal) / winterTotal) * 100);
            trends.push({
                type: 'SEASONAL PATTERN',
                icon: '📅',
                headline: `Spring pet licensing runs ${percentHigher}% higher than winter months`,
                detail: `March–May registrations total ${springTotal.toLocaleString()} vs ${winterTotal.toLocaleString()} in December–February, suggesting post-adoption licensing spikes in spring.`,
                color: 'pink'
            });
        }
    }
    
    return trends.slice(0, 5);
}

// Calculate summary statistics
// Uses getCatsVsDogs() for counts so capitalization in the CSV doesn't matter
function getSummaryStats(data) {
    const speciesData = getCatsVsDogs(data);
    
    return {
        totalPets: data.length,
        totalDogs: speciesData.dogs.count,
        totalCats: speciesData.cats.count,
        dogPercentage: speciesData.dogs.percentage,
        catPercentage: speciesData.cats.percentage,
        uniqueNames: new Set(data.map(pet => pet['Animal\'s Name']).filter(Boolean)).size,
        uniqueBreeds: new Set(data.map(pet => pet['Primary Breed']).filter(Boolean)).size,
        uniqueZipCodes: new Set(data.map(pet => pet['ZIP Code']).filter(Boolean)).size
    };
}

// Build a zip code lookup table for fast search.
// Call this once when data loads — each search is then instant.
function buildZipLookup(data) {
    const lookup = {};
    
    data.forEach(pet => {
        const zip = pet['ZIP Code']?.trim();
        if (!zip) return;
        
        if (!lookup[zip]) {
            lookup[zip] = { total: 0, dogs: 0, cats: 0, breeds: {}, years: {} };
        }
        
        const entry = lookup[zip];
        entry.total++;
        
        const species = pet.Species?.toLowerCase();
        if (species === 'dog') {
            entry.dogs++;
            const breed = pet['Primary Breed']?.trim();
            if (breed) entry.breeds[breed] = (entry.breeds[breed] || 0) + 1;
        } else if (species === 'cat') {
            entry.cats++;
        }
        
        const year = getYear(pet['License Issue Date']);
        if (year) entry.years[year] = (entry.years[year] || 0) + 1;
    });
    
    return lookup;
}

// Get a formatted summary for a single zip code (used by the search feature)
function getZipSummary(zipLookup, zip) {
    const entry = zipLookup[zip];
    if (!entry) return null;
    
    // Top 3 dog breeds for this zip
    const topBreeds = Object.entries(entry.breeds)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));
    
    // Trend: compare average registrations in first half of years vs second half
    const years = Object.keys(entry.years).map(Number).sort();
    let trend = 'stable';
    if (years.length >= 4) {
        const mid = Math.floor(years.length / 2);
        const firstAvg = years.slice(0, mid).reduce((sum, y) => sum + entry.years[y], 0) / mid;
        const secondAvg = years.slice(mid).reduce((sum, y) => sum + entry.years[y], 0) / (years.length - mid);
        if (secondAvg > firstAvg * 1.1) trend = 'growing';
        if (secondAvg < firstAvg * 0.9) trend = 'declining';
    }
    
    const total = entry.dogs + entry.cats;
    
    return {
        zip,
        total: entry.total,
        dogs: entry.dogs,
        cats: entry.cats,
        dogPercent: total > 0 ? Math.round((entry.dogs / total) * 100) : 0,
        catPercent: total > 0 ? Math.round((entry.cats / total) * 100) : 0,
        topBreeds,
        trend
    };
}

// Generic helper - fetches demographic data for any entity
async function fetchDemographicObservations(entityId) {
  const variables = [
    'Count_Person',
    'Median_Income_Person', 
    'Median_Age_Person'
  ];
  const url = `https://dc-proxy-950088134961.us-central1.run.app?entity=${entityId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('DataCommons API error:', response.status);
      return null;
    }
    const data = await response.json();
    const results = {};

    for (const variable of variables) {
      const entityData = data.byVariable[variable]?.byEntity[entityId];
      if (entityData?.orderedFacets?.length > 0) {
        const observations = entityData.orderedFacets[0].observations;
        const latest = observations[observations.length - 1];
        results[variable] = { value: latest.value, date: latest.date };
      }
    }
    return results;
  } catch (error) {
    console.error('Failed to fetch demographic data:', error);
    return null;
  }
}

// Fetch demographics for a zip code
async function fetchDemographicData(zipCode) {
  return fetchDemographicObservations(`zip/${zipCode}`);
}

// Fetch national averages
async function fetchNationalData() {
  return fetchDemographicObservations('country/USA');
}