// Helper function to get path prefix based on current page location
function getPathPrefix() {
    const path = window.location.pathname;
    return path.includes('/html/') ? '../' : '';
}

// movie loader
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

// load movies
async function loadMovies(endpoint, divId, noResultsMessage) {
    const resultDiv = document.getElementById(divId);
    if (!resultDiv) {
        console.log(`Skipping ${divId} - container missing`);
        return;
    }
    
    try {
        resultDiv.innerHTML = "";
        
        const apiKey = TMDBapiKey;
        const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            resultDiv.innerHTML = `<p>Error loading movies</p>`;
            return;
        }
        
        const json = await response.json();
        const allObjects = json.results || [];
        
        if (allObjects.length === 0) {
            resultDiv.innerHTML = `<p>${noResultsMessage}</p>`;
            return;
        }
        
        allObjects.forEach(object => {
            renderMovieItem(object, resultDiv);
        });
        
        setupInfiniteMovies(resultDiv)

    } catch (error) {
        console.error(`Load ${endpoint} failed:`, error);
        resultDiv.innerHTML = `<p>Failed to load movies</p>`;
    }
}

// infinite scroll
function setupInfiniteMovies(resultDiv) {
    if (!resultDiv || resultDiv.dataset.loopSetup === "true") return;

    const originalHTML = resultDiv.innerHTML;
    resultDiv.innerHTML += originalHTML;
    resultDiv.dataset.loopSetup = "true";
    resultDiv.dataset.paused = "false";

    const speed = 0.4;
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    function step() {
        if (resultDiv.dataset.paused === "true") {
            requestAnimationFrame(step);
            return;
        }

        resultDiv.scrollLeft += speed;
        const halfWidth = resultDiv.scrollWidth / 2;
        if (resultDiv.scrollLeft >= halfWidth) {
            resultDiv.scrollLeft -= halfWidth;
        }

        requestAnimationFrame(step);
    }

    // Drag functionality
    resultDiv.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startScrollLeft = resultDiv.scrollLeft;
        resultDiv.dataset.paused = "true";
        resultDiv.style.cursor = "grabbing";
    });

    resultDiv.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        
        const dragDistance = e.clientX - startX;
        resultDiv.scrollLeft = startScrollLeft - dragDistance;
    });

    resultDiv.addEventListener("mouseup", () => {
        isDragging = false;
        resultDiv.style.cursor = "grab";
        resultDiv.dataset.paused = "false";
    });

    resultDiv.addEventListener("mouseleave", () => {
        if (isDragging) {
            isDragging = false;
            resultDiv.style.cursor = "grab";
        }
        resultDiv.dataset.paused = "false";
    });

    resultDiv.addEventListener("mouseenter", () => {
        if (!isDragging) {
            resultDiv.dataset.paused = "true";
        }
    });

    // Scroll wheel
    resultDiv.addEventListener("wheel", (e) => {
        e.preventDefault();
        resultDiv.scrollLeft += e.deltaY > 0 ? 50 : -50;
        resultDiv.dataset.paused = "true";
        
        // Resume auto-scroll after scrolling
        clearTimeout(resultDiv.scrollTimeout);
        resultDiv.scrollTimeout = setTimeout(() => {
            resultDiv.dataset.paused = "false";
        }, 1500);
    });

    resultDiv.style.cursor = "grab";
    resultDiv.scrollLeft = 0;
    requestAnimationFrame(step);
}

// random trailers
async function loadTwoRandomTrailers() {
    const container1 = document.getElementById("randomTrailer1");
    const container2 = document.getElementById("randomTrailer2");

    if (!container1 && !container2){
        console.log("No trailer containers found - skipping")
        return;
    }

    if (container1) container1.innerHTML = "<p>Loading...</p>";
    if (container2) container2.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch(`${TMDB_BASE}/movie/now_playing?api_key=${TMDBapiKey}`);
        if (!response.ok) {
            throw new Error("Failed to fetch now playing movies");
        }
        const data = await response.json();
        const movies = data.results;

        if (movies.length < 2) throw new Error("Not enough movies to select trailers from");

        const shuffledMovies = movies.sort(() => 0.5 - Math.random());
        const movie1 = shuffledMovies[0];
        const movie2 = shuffledMovies[1];

        await loadTrailerForContainer(movie1, container1);
        await loadTrailerForContainer(movie2, container2);
    } catch (error) {
        console.error("Error loading random trailers:", error);
        container1.innerHTML = "<p>Error loading trailer</p>";
        container2.innerHTML = "<p>Error loading trailer</p>";
    }
}

// trailer fetch
async function loadTrailerForContainer(movie, container) {
    try {
        const response = await fetch(`${TMDB_BASE}/movie/${movie.id}/videos?api_key=${TMDBapiKey}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch videos for movie ID ${movie.id}`);
        }
        const data = await response.json();
        const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");

        if (trailer) {
            container.innerHTML = `
                <h4>${movie.title}</h4>
                <iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>
            `;
        } else {
            container.innerHTML = `<p>No trailer available for <a href="${getPathPrefix()}html/movieinfo.html?movieId=${movie.id}">${movie.title}</a></p>`;
        }
    } catch (error) {
        container.innerHTML = `<p>Error loading trailer for ${movie.title}</p>`;
    }
}

// init homepage
window.addEventListener("DOMContentLoaded", () => {
    const containers = {
        popularMovies: document.getElementById("popularMovies"),
        nowShowing: document.getElementById("nowShowing"),
        upcomingMovies: document.getElementById("upcomingMovies"),
        topRatedMovies: document.getElementById("topRatedMovies")
    };
    
    if (containers.popularMovies) {
        loadMovies("movie/popular", "popularMovies", "No popular movies found");
    }
    if (containers.nowShowing) {
        loadMovies("movie/now_playing", "nowShowing", "No movies currently playing found");
    }
    loadTwoRandomTrailers();
});

// init genre select
document.addEventListener("DOMContentLoaded", () => {
    const genreSelect = document.getElementById("genreSelect");
    if (genreSelect) {
        genreSelect.addEventListener("change", async (e) => {
            const genreId = e.target.value;
            const genreMovies = document.getElementById("genreMovies");
            
            if (!genreId || !genreMovies) return;
            
            genreMovies.innerHTML = "<p>Loading...</p>";
            
            try {
                const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDBapiKey}&with_genres=${genreId}&language=en-US`;
                const response = await fetch(url);
                
                if (!response.ok) throw new Error(`API ${response.status}`);
                
                const data = await response.json();
                genreMovies.innerHTML = "";
                
                data.results.forEach(movie => renderMovieItem(movie, genreMovies));
            } catch (error) {
                console.error("Genre error:", error);
                genreMovies.innerHTML = `<p>Error loading genre</p>`;
            }
        });
    }
});