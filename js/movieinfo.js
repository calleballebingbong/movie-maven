// Helper function to get path prefix based on current page location
function getPathPrefix() {
    const path = window.location.pathname;
    return path.includes('/html/') ? '../' : '';
}

let apiKey = TMDBapiKey;

// movie details
async function fetchMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get("movieId");

    if (!movieId) {
        console.error("No movieId provided in the URL");
        document.getElementById("movieInfo").innerHTML = `<p>No movie chosen. <a href='${getPathPrefix()}index.html'>Go back to home</a></p>`;
        return;
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
        if (!response.ok) {
            throw new Error("Could not fetch movie details");
        }
        const movie = await response.json();
        const cast = await fetchCast(movieId);
        const isNowPlaying = await checkIfNowPlaying(movieId);
        displayMovieDetails(movie, isNowPlaying, cast);
    } catch (error) {
        console.error("Error fetching movie details:", error);
        document.getElementById("details").innerHTML = `<p>Error loading movie details. <a href='${getPathPrefix()}index.html'>Go back to home</a></p>`;
    }
}

// now playing
async function checkIfNowPlaying(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`);
        if (!response.ok) return false;
        const data = await response.json();
        return data.results.some(movie => movie.id === parseInt(movieId));
    } catch (error) {
        console.error("Error checking now playing:", error);
        return false;
    }
}

// get trailer
async function getTrailerUrl(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`);
        if (!response.ok) return null;
        const data = await response.json();
        const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    } catch (error) {
        console.error("Error fetching trailer:", error);
        return null;
    }
}

// load cast
async function fetchCast(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.cast ? data.cast.slice(0, 10) : [];
    } catch (error) {
        console.error("Error fetching cast:", error);
        return [];
    }
}

// render details
function displayMovieDetails(movie, isNowPlaying, cast) {
    document.title = `Details: ${movie.title}`;
    const ticketButtonHtml = isNowPlaying ? '<button id="ticketButton">Find Tickets</button>' : '';
    
    let castHtml = '';
    if (cast && cast.length > 0) {
        castHtml = `
            <div class="cast-section">
                <h2>Cast</h2>
                <div class="cast-list">
                    ${cast.map(actor => `
                        <div class="cast-item">
                            ${actor.profile_path ? `<img src="https://image.tmdb.org/t/p/w185${actor.profile_path}" alt="${actor.name}" class="actor-image">` : `<div class="actor-image-placeholder">No Image</div>`}
                            <p class="actor-name">${actor.name}</p>
                            <p class="actor-character">${actor.character || 'N/A'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    document.getElementById("details").innerHTML = `
        <img class="info-poster" src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} poster">
        <div class="info-text-container">
            <h1>${movie.title}</h1>
            <button id="trailerButton">Watch Trailer</button>
            ${ticketButtonHtml}
            <p class="info-txt"><strong>Overview:</strong> ${movie.overview}</p>
            <p><strong>Rating:</strong> ${movie.vote_average} / 10</p>
            <p><strong>Genres:</strong> ${movie.genres.map(genre => genre.name).join(", ")}</p>
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
        </div>
        ${castHtml}
    `;
    setupTrailerButton(movie);
    if (isNowPlaying) {
        setupTicketButton(movie);
    }
}

// trailer button
async function setupTrailerButton(movie) {
    const trailerButton = document.getElementById("trailerButton");
    if (!trailerButton) return;

    trailerButton.addEventListener("click", async () => {
        const trailerUrl = await getTrailerUrl(movie.id);
        if (trailerUrl) {
            window.open(trailerUrl, "_blank");
        } else {
            alert("No trailer available for this movie.");
        }
    });
}

// ticket button
async function setupTicketButton(movie) {
    const ticketButton = document.getElementById("ticketButton");
    if (!ticketButton) return;

    ticketButton.addEventListener("click", async () => {
        let swedishTitle = movie.title;

        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=sv-SE`);
            if (response.ok) {
                const swMovie = await response.json();
                if (swMovie.title) {
                    swedishTitle = swMovie.title;
                }
            }
        } catch (error) {
            console.error("Could not load Swedish title:", error);
        }

        const slug = encodeURIComponent(
            swedishTitle
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "")
        );

        window.location.href = `https://www.filmstaden.se/film/${slug}`;
    });
}
    
window.addEventListener('load', fetchMovieDetails);