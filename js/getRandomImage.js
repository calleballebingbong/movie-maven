// hero background
async function setRandomHeroBackground() {
    try {
        const apiKey = TMDBapiKey;
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const movies = data.results || [];
        const heroElems = document.querySelectorAll(".hero-bg");
        
        if (!movies.length || !heroElems.length) return;
        
        const usedIndexes = new Set();
        heroElems.forEach((hero, heroIndex) => {
            let randomIndex;
            if (usedIndexes.size >= movies.length) {
                randomIndex = Math.floor(Math.random() * movies.length);
            } else {
                do {
                    randomIndex = Math.floor(Math.random() * movies.length);
                } while (usedIndexes.has(randomIndex));
                usedIndexes.add(randomIndex);
            }
            
            const selectedMovie = movies[randomIndex];
            const imagePath = selectedMovie.backdrop_path || selectedMovie.poster_path;
            
            if (imagePath) {
                hero.style.backgroundImage = `
                    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
                    url("https://image.tmdb.org/t/p/w1280${imagePath}")
                `;
            }
        });
    } catch (error) {
        console.error("Failed to load hero background:", error);
    }
}

document.addEventListener("DOMContentLoaded", setRandomHeroBackground);

//  function to get path prefix based on current page location
function getPathPrefix() {
    const path = window.location.pathname;
    return path.includes('/html/') ? '../' : '';
}

// Redirect to a random popular movie
async function goToRandomPopularMovie() {
    try {
        const apiKey = TMDBapiKey;
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch popular movies');
        const data = await response.json();
        const movies = data.results || [];
        if (!movies.length) return;
        const randomIndex = Math.floor(Math.random() * movies.length);
        const movie = movies[randomIndex];
        if (movie && movie.id) {
            window.location.href = `${getPathPrefix()}html/movieinfo.html?movieId=${movie.id}`;
        }
    } catch (error) {
        console.error('Failed to redirect to random movie:', error);
    }
}

window.goToRandomPopularMovie = goToRandomPopularMovie;