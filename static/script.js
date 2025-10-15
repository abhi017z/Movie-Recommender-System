// Movie Recommendation System - Frontend JavaScript

class MovieRecommendationApp {
    constructor() {
        this.apiBase = '/api';
        this.debounceTimer = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.showWelcomeMessage();
    }

    bindEvents() {
        // Search button click
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.getRecommendations();
        });

        // Enter key press in input
        document.getElementById('movieInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.getRecommendations();
            }
        });

        // Auto-complete functionality
        document.getElementById('movieInput').addEventListener('input', (e) => {
            this.handleAutoComplete(e.target.value);
        });

        // Click outside to close autocomplete
        document.addEventListener('click', (e) => {
            if (!document.querySelector('.search-input-container').contains(e.target)) {
                this.hideAutoComplete();
            }
        });
    }

    showWelcomeMessage() {
        console.log('🎬 CinemaAI Movie Recommendation System Ready!');
        console.log('Enter a movie you love and discover similar films you might enjoy.');
    }

    async getRecommendations() {
        const movieName = document.getElementById('movieInput').value.trim();
        const numRecommendations = parseInt(document.getElementById('numRecommendations').value);

        if (!movieName) {
            this.showError('Please enter a movie name');
            return;
        }

        this.showLoading();
        this.hideError();
        this.hideResults();

        try {
            const response = await fetch(`${this.apiBase}/recommend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movieName: movieName,
                    numRecommendations: numRecommendations
                })
            });

            const data = await response.json();

            if (data.error) {
                this.showError(data.error);
            } else {
                this.showResults(data);
            }

        } catch (error) {
            console.error('Error fetching recommendations:', error);
            this.showError('Failed to get recommendations. Please check your connection and try again.');
        } finally {
            this.hideLoading();
        }
    }

    async handleAutoComplete(query) {
        // Clear previous timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        if (!query || query.length < 2) {
            this.hideAutoComplete();
            return;
        }

        // Debounce the API call
        this.debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`${this.apiBase}/search?q=${encodeURIComponent(query)}`);
                const suggestions = await response.json();
                this.showAutoComplete(suggestions);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                this.hideAutoComplete();
            }
        }, 300);
    }

    showAutoComplete(suggestions) {
        const container = document.getElementById('autocomplete-suggestions');
        
        if (suggestions.length === 0) {
            this.hideAutoComplete();
            return;
        }

        container.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => {
                document.getElementById('movieInput').value = suggestion;
                this.hideAutoComplete();
            });
            container.appendChild(item);
        });

        container.classList.add('show');
    }

    hideAutoComplete() {
        const container = document.getElementById('autocomplete-suggestions');
        container.classList.remove('show');
        container.innerHTML = '';
    }

    showLoading() {
        document.getElementById('loadingSpinner').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        errorText.textContent = message;
        errorElement.classList.remove('hidden');
        
        // Scroll to error message
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    hideError() {
        document.getElementById('errorMessage').classList.add('hidden');
    }

    showResults(data) {
        const resultsSection = document.getElementById('resultsSection');
        const inputMovieTitle = document.getElementById('inputMovieTitle');
        const movieGrid = document.getElementById('movieGrid');

        // Set the input movie title
        inputMovieTitle.textContent = data.inputMovie;

        // Clear previous results
        movieGrid.innerHTML = '';

        // Create movie cards
        data.recommendations.forEach((movie, index) => {
            const movieCard = this.createMovieCard(movie, index);
            movieGrid.appendChild(movieCard);
        });

        // Show results section with animation
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Add staggered animation to cards
        this.animateMovieCards();
    }

    hideResults() {
        document.getElementById('resultsSection').classList.add('hidden');
    }

    createMovieCard(movie, index) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <h4 class="movie-title">${this.escapeHtml(movie.title)}</h4>
            <div class="movie-info">
                <strong>Genres:</strong> <span>${this.escapeHtml(movie.genres || 'N/A')}</span>
            </div>
            <div class="movie-info">
                <strong>Cast:</strong> <span>${this.escapeHtml(movie.cast || 'N/A')}</span>
            </div>
            <div class="movie-info">
                <strong>Director:</strong> <span>${this.escapeHtml(movie.director || 'N/A')}</span>
            </div>
        `;

        return card;
    }

    animateMovieCards() {
        const cards = document.querySelectorAll('.movie-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MovieRecommendationApp();
});

// Add some utility functions for enhanced user experience
window.addEventListener('load', () => {
    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to search
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('searchBtn').click();
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            document.getElementById('movieInput').value = '';
            document.getElementById('movieInput').focus();
        }
    });

    // Add focus to search input
    document.getElementById('movieInput').focus();
});

// Add some helpful console messages for developers
console.log(`
🎬 CinemaAI Movie Recommendation System
=====================================
🔍 Search for movies and get AI-powered recommendations
⌨️  Keyboard shortcuts:
   • Ctrl/Cmd + Enter: Search
   • Escape: Clear search
📱 Responsive design works on all devices
🎨 Beautiful animations and smooth interactions
`);