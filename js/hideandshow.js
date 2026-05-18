// search toggle
function toggleSearchResults(show) {
    const results = document.getElementById("menuSearchResults");
    results.style.visibility = show ? "visible" : "hidden";
}

// Hide search on outside click
document.addEventListener('click', function(event) {
    const searchInput = document.getElementById("menuSearch");
    const searchResults = document.getElementById("menuSearchResults");
    
    if (!searchInput.contains(event.target) && 
        !searchResults.contains(event.target)) {
        toggleSearchResults(false);
    }
});

// Show/hide on focus/blur
document.getElementById("menuSearch").addEventListener('focus', () => {
    toggleSearchResults(true);
});

document.getElementById("menuSearch").addEventListener('blur', () => {
    //click delay
    setTimeout(() => toggleSearchResults(false), 150);
});