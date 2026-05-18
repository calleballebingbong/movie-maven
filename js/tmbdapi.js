// Helper function to get path prefix based on current page location
function getPathPrefix() {
    const path = window.location.pathname;
    return path.includes('/html/') ? '../' : '';
}

// DOM CACHE - PERFORMANCE BOOST
const txtSearch = document.getElementById("txtSearch");
const menuSearch = document.getElementById("menuSearch");
const menuSearchResults = document.getElementById("menuSearchResults");
const searchresults = document.getElementById("searchresults");
const searchFor = document.getElementById("searchFor");

const TMDB_SEARCH_BASE = 'https://api.themoviedb.org/3/search/movie';
const TMDB_GENRES_URL = 'https://api.themoviedb.org/3/genre/movie/list';

// Store for filtering
let allSearchResults = [];
let genresList = [];
let selectedGenres = new Set();
let selectedLanguages = new Set();

// search movies
async function search(searchString) {
    try {
        const apiKey = TMDBapiKey;
        const url = `${TMDB_SEARCH_BASE}?query=${encodeURIComponent(searchString)}&api_key=${apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Search API failed');
        
        const json = await response.json();
        return json;
    } catch (error) {
        console.error('Search failed:', error);
        return { results: [] };
    }
}

// render movie item
function renderMovieItem(object, container, isMenu = false) {
    const size = isMenu ? 'w92' : 'w500';
    const posterSrc = object.poster_path 
        ? `https://image.tmdb.org/t/p/${size}${object.poster_path}`
        : `${getPathPrefix()}images/placeholder.png`;
    
    const itemClass = isMenu ? 'menu-result-item' : 'movie-item';
    const imgClass = isMenu ? 'Menu-movie-poster' : 'movie-poster';
    const titleClass = isMenu ? 'Menu-movie-title menu-title' : 'movie-title';
    
    container.innerHTML += `
        <div class="${itemClass}">
            <a href="${getPathPrefix()}html/movieinfo.html?movieId=${object.id}">
                <img class="${imgClass}" src="${posterSrc}" alt="${object.title}" loading="lazy">
            </a>
            <p class="${titleClass}">
                <a href="${getPathPrefix()}html/movieinfo.html?movieId=${object.id}">${object.title}</a>
            </p>
        </div>
    `;
}

// load genres
async function getGenres() {
    try {
        const apiKey = TMDBapiKey;
        const url = `${TMDB_GENRES_URL}?api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.genres || [];
    } catch (error) {
        console.error('Failed to fetch genres:', error);
        return [];
    }
}

// show results
async function renderResults(results, term) {
    if (searchFor) {
        searchFor.innerHTML = `<h1>Searching for: "${term}"</h1>`;
    }
    
    if (searchresults) {
        const allObjects = results.results || [];
        
        if (allObjects.length === 0) {
            searchresults.innerHTML = "<p>No results found</p>";
            return;
        }
        
        // Get genres if not already loaded
        if (genresList.length === 0) {
            genresList = await getGenres();
        }
        
        // Store results for filtering
        allSearchResults = allObjects;
        selectedGenres.clear();
        selectedLanguages.clear();
        
        // Extract unique genres from results
        const uniqueGenreIds = [...new Set(allSearchResults.flatMap(m => m.genre_ids || []))];
        displayGenreFilters(uniqueGenreIds);
        
        // Extract unique languages from results
        const uniqueLanguages = [...new Set(allSearchResults.map(m => m.original_language).filter(Boolean))];
        displayLanguageFilters(uniqueLanguages);
        
        // Display all results initially
        displayFilteredResults(allSearchResults);
    }
}

// genre filter buttons
function displayGenreFilters(genreIds) {
    const filterContainer = document.getElementById("genreFilters");
    if (!filterContainer) return;
    
    filterContainer.innerHTML = "<strong>Filter by Genre:</strong> <br>";
    
    genreIds.sort((a, b) => {
        const genreA = genresList.find(g => g.id === a)?.name || '';
        const genreB = genresList.find(g => g.id === b)?.name || '';
        return genreA.localeCompare(genreB);
    }).forEach(genreId => {
        const genre = genresList.find(g => g.id === genreId);
        if (genre) {
            const button = document.createElement("button");
            button.textContent = genre.name;
            button.className = "genre-filter-btn";
            button.dataset.genreId = genreId;
            button.onclick = () => toggleGenreFilter(genreId, button);
            filterContainer.appendChild(button);
        }
    });
}

// toggle genre
function toggleGenreFilter(genreId, buttonElement) {
    if (selectedGenres.has(genreId)) {
        selectedGenres.delete(genreId);
        buttonElement.classList.remove("active");
    } else {
        selectedGenres.add(genreId);
        buttonElement.classList.add("active");
    }
    
    // Filter and display results
    displayFilteredResults(applyFilters());
}

// language filter buttons
function displayLanguageFilters(languages) {
    const filterContainer = document.getElementById("languageFilters");
    if (!filterContainer) return;
    
    filterContainer.innerHTML = "<strong>Filter by Language:</strong> <br>";
    
    // Sort languages alphabetically by code
    languages.sort().forEach(langCode => {
        const langName = getLanguageName(langCode);
        const button = document.createElement("button");
        button.textContent = langName;
        button.className = "language-filter-btn";
        button.dataset.langCode = langCode;
        button.onclick = () => toggleLanguageFilter(langCode, button);
        filterContainer.appendChild(button);
    });
}

// map language code
function getLanguageName(langCode) {
    const languageNames = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'ko': 'Korean',
        'hi': 'Hindi',
        'ar': 'Arabic',
        'nl': 'Dutch',
        'pl': 'Polish',
        'tr': 'Turkish',
        'th': 'Thai',
        'sv': 'Swedish',
        'no': 'Norwegian',
        'da': 'Danish',
        'fi': 'Finnish',
        'cs': 'Czech',
        'hu': 'Hungarian',
        'el': 'Greek',
        'ro': 'Romanian',
        'uk': 'Ukrainian',
        'vi': 'Vietnamese',
        'id': 'Indonesian',
        'ms': 'Malay',
        'tl': 'Tagalog',
        'fa': 'Persian'
    };
    return languageNames[langCode] || langCode.toUpperCase();
}

// toggle language
function toggleLanguageFilter(langCode, buttonElement) {
    if (selectedLanguages.has(langCode)) {
        selectedLanguages.delete(langCode);
        buttonElement.classList.remove("active");
    } else {
        selectedLanguages.add(langCode);
        buttonElement.classList.add("active");
    }
    
    // Filter and display results
    displayFilteredResults(applyFilters());
}

// apply filters
function applyFilters() {
    let filtered = allSearchResults;
    
    // Filter by genres
    if (selectedGenres.size > 0) {
        filtered = filtered.filter(movie => {
            return (movie.genre_ids || []).some(id => selectedGenres.has(id));
        });
    }
    
    // Filter by languages
    if (selectedLanguages.size > 0) {
        filtered = filtered.filter(movie => {
            return selectedLanguages.has(movie.original_language);
        });
    }
    
    return filtered;
}

// render filtered results
function displayFilteredResults(moviesToDisplay) {
    if (searchresults) {
        searchresults.innerHTML = "";
        
        if (moviesToDisplay.length === 0) {
            searchresults.innerHTML = "<p>No results found for selected filters</p>";
            const showMoreButton = document.getElementById("showMoreButton");
            if (showMoreButton) {
                showMoreButton.style.display = "none";
            }
            return;
        }
        
        moviesToDisplay.forEach(object => renderMovieItem(object, searchresults));
        
        // Show "Show More" button only if there are 4 or more results
        const showMoreButton = document.getElementById("showMoreButton");
        if (showMoreButton) {
            showMoreButton.style.display = moviesToDisplay.length >= 4 ? "block" : "none";
        }
    }
}

// menu dropdown
async function renderMenuResults(results) {
    if (!menuSearchResults) return;
    
    menuSearchResults.innerHTML = "";
    const allObjects = results.results || [];
    
    if (allObjects.length === 0) {
        menuSearchResults.innerHTML = "<p>No results found</p>";
        return;
    }
    
    //top 5
    allObjects.slice(0, 5).forEach(object => {
        renderMovieItem(object, menuSearchResults, true);
    });
}

// hero search
if (txtSearch) {
    txtSearch.addEventListener('keydown', async (event) => {
        if (event.key === "Enter" && txtSearch.value.trim().length > 0) {
            event.preventDefault();
            const searchTerm = txtSearch.value.trim();
            
            // Navigate to results
            window.location.href = `${getPathPrefix()}html/resultpage.html?search=${encodeURIComponent(searchTerm)}`;
        }
    });
}

// menu search w live typing
if (menuSearch) {
    menuSearch.addEventListener('input', async () => {
        const searchTerm = menuSearch.value.trim();
        
        if (searchTerm.length > 0) {
            if (menuSearchResults) {
                // position the dropdown under the search input on the right
                positionMenuDropdown();
                menuSearchResults.style.visibility = "visible";
                menuSearchResults.style.display = "block";
            }
            const results = await search(searchTerm);
            renderMenuResults(results);
        } else if (menuSearchResults) {
            menuSearchResults.innerHTML = "";
            menuSearchResults.style.visibility = "hidden";
            menuSearchResults.style.display = "none";
            // clear inline positioning so CSS rules take over
            menuSearchResults.style.top = '';
            menuSearchResults.style.left = '';
            menuSearchResults.style.right = '';
        }
    });

    // menu search Enter key to go to results page
    menuSearch.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && menuSearch.value.trim().length > 0) {
            event.preventDefault();
            const searchTerm = menuSearch.value.trim();
            window.location.href = `${getPathPrefix()}html/resultpage.html?search=${encodeURIComponent(searchTerm)}`;
        }
    });
}

function showsearch() {
    if (!menuSearchResults || !menuSearch) return;
    try {
        const val = menuSearch.value ? menuSearch.value.trim() : '';
        if (val.length > 0) {
            positionMenuDropdown();
            menuSearchResults.style.visibility = 'visible';
            menuSearchResults.style.display = 'block';
        }
    } catch (e) {
        console.warn('showsearch failed', e);
    }
}

function hidesearch() {
    if (!menuSearchResults) return;
    setTimeout(() => {
        const active = document.activeElement;
        if (active && menuSearchResults.contains(active)) return;
        menuSearchResults.style.visibility = 'hidden';
        menuSearchResults.style.display = 'none';
    }, 150);
}


function menuSearchbar() {
    if (!menuSearch) return;
    menuSearch.dispatchEvent(new Event('input', { bubbles: true }));
}

//position menu dropdown for mobile & desktop
function positionMenuDropdown() {
    if (!menuSearch || !menuSearchResults) return;
    try {
        const rect = menuSearch.getBoundingClientRect();
        const top = rect.bottom;

        if (window.innerWidth <= 767) {
            menuSearchResults.style.position = 'fixed';
            menuSearchResults.style.top = top + 'px';
            menuSearchResults.style.left = '10px';
            menuSearchResults.style.right = '10px';
            menuSearchResults.style.width = 'auto';
        } else {
            const right = Math.max(8, Math.round(window.innerWidth - rect.right));
            const dropdownWidth = 420;

            menuSearchResults.style.position = 'fixed';
            menuSearchResults.style.top = top + 'px';
            menuSearchResults.style.right = right + 'px';
            menuSearchResults.style.left = 'auto';
            menuSearchResults.style.width = dropdownWidth + 'px';
        }
    } catch (e) {
        console.warn('Failed to position menu dropdown', e);
    }
}

// Reposition on resize/scroll while visible
window.addEventListener('resize', () => {
    if (menuSearchResults && menuSearchResults.style.display === 'block') positionMenuDropdown();
});
window.addEventListener('scroll', () => {
    if (menuSearchResults && menuSearchResults.style.display === 'block') positionMenuDropdown();
});

//url search
const urlParams = new URLSearchParams(window.location.search);
const queryFromUrl = urlParams.get("search");

if (queryFromUrl) {
    performSearch(queryFromUrl);
}

async function performSearch(term) {
    const results = await search(term);
    renderResults(results, term);
}

//show more
function updateShowMoreButtonVisibility() {
    const showMoreButton = document.getElementById("showMoreButton");
    if (!showMoreButton) return;
    
    console.log("Show more button visibility updated");
}

function showMoreResults() {
    const showMoreButton = document.getElementById("showMoreButton");
    const searchResultsDiv = document.getElementById("searchresults");
    
    if (showMoreButton && searchResultsDiv) {
        searchResultsDiv.style.maxHeight = "none";
        searchResultsDiv.style.overflow = "visible";
        showMoreButton.style.display = "none";
    }
}