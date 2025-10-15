from flask import Flask, render_template, request, jsonify
import pandas as pd
import difflib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
import logging

def clean_text(text):
    """Clean and normalize text data"""
    if pd.isna(text) or text is None:
        return ''
    
    # Convert to string and handle encoding issues
    text = str(text)
    
    # Replace common encoding issues
    text = text.replace('\\', '')
    text = text.replace('\u00e5', 'å')
    text = text.replace('\u00e4', 'ä')
    text = text.replace('\u00f6', 'ö')
    text = text.replace('\u00c5', 'Å')
    text = text.replace('\u00c4', 'Ä')
    text = text.replace('\u00d6', 'Ö')
    
    # Handle other common escape sequences
    try:
        text = text.encode('utf-8').decode('unicode_escape', errors='ignore')
    except:
        pass
    
    return text.strip()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global variables to store the processed data
movies_data = None
similarity = None
vectorizer = None
feature_vectors = None

def load_and_process_data():
    """Load and preprocess the movie data"""
    global movies_data, similarity, vectorizer, feature_vectors
    
    try:
        logger.info("Loading movie dataset...")
        # Load dataset
        movies_data = pd.read_csv('movies.csv')
        logger.info(f"Successfully loaded {len(movies_data)} movies from CSV")
        
        # Limit to first 1000 movies for faster processing
        movies_data = movies_data.head(1000)
        logger.info(f"Processing first {len(movies_data)} movies...")
        
        # Select relevant features
        selected_features = ['genres', 'keywords', 'tagline', 'cast', 'director']
        
        # Replace nulls with empty string
        for feature in selected_features:
            if feature in movies_data.columns:
                movies_data[feature] = movies_data[feature].fillna('')
            else:
                movies_data[feature] = ''
        
        # Combine features into a single string
        logger.info("Combining movie features...")
        combined_features = (
            movies_data['genres'] + ' ' +
            movies_data['keywords'] + ' ' +
            movies_data['tagline'] + ' ' +
            movies_data['cast'] + ' ' +
            movies_data['director']
        )
        
        # Convert text to feature vectors
        logger.info("Computing TF-IDF vectors...")
        vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        feature_vectors = vectorizer.fit_transform(combined_features)
        
        # Compute similarity scores
        logger.info("Computing similarity matrix...")
        similarity = cosine_similarity(feature_vectors)
        
        logger.info("Data loaded and processed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error loading data: {e}")
        return False

def get_movie_recommendations(movie_name, num_recommendations=10):
    """Get movie recommendations based on input movie name"""
    global movies_data, similarity
    
    if movies_data is None or similarity is None:
        return {"error": "Data not loaded properly"}
    
    try:
        # Get all movie titles
        list_of_all_titles = movies_data['title'].tolist()
        
        # Find closest match
        find_close_match = difflib.get_close_matches(movie_name, list_of_all_titles, n=1, cutoff=0.3)
        if not find_close_match:
            return {"error": f"Movie '{movie_name}' not found in dataset. Please try a different movie name."}
        
        close_match = find_close_match[0]
        
        # Get index of the matched movie
        index_of_the_movie = movies_data[movies_data['title'] == close_match].index[0]
        
        # Get similarity scores
        similarity_score = list(enumerate(similarity[index_of_the_movie]))
        
        # Sort movies based on similarity (excluding the input movie itself)
        sorted_similar_movies = sorted(similarity_score, key=lambda x: x[1], reverse=True)[1:num_recommendations+1]
        
        # Prepare recommendations
        recommendations = []
        for movie in sorted_similar_movies:
            index = movie[0]
            movie_info = movies_data.iloc[index]
            
            cast_info = str(movie_info.get('cast', ''))
            cast_display = clean_text(cast_info)
            cast_display = cast_display[:100] + '...' if len(cast_display) > 100 else cast_display
            
            recommendations.append({
                'title': clean_text(str(movie_info.get('title', ''))),
                'genres': clean_text(str(movie_info.get('genres', ''))),
                'cast': cast_display,
                'director': clean_text(str(movie_info.get('director', ''))),
                'similarityScore': round(movie[1] * 100, 2)
            })
        
        return {
            "inputMovie": close_match,
            "recommendations": recommendations
        }
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return {"error": f"An error occurred: {str(e)}"}

@app.route('/')
def home():
    """Render the main page"""
    return render_template('index.html')

@app.route('/api/recommend', methods=['POST'])
def recommend():
    """API endpoint for getting movie recommendations"""
    try:
        data = request.get_json()
        movie_name = data.get('movieName', '').strip()
        num_recommendations = int(data.get('numRecommendations', 10))
        
        if not movie_name:
            return jsonify({"error": "Please enter a movie name"}), 400
        
        logger.info(f"Getting recommendations for: {movie_name}")
        recommendations = get_movie_recommendations(movie_name, num_recommendations)
        
        if "error" in recommendations:
            return jsonify(recommendations), 400
        
        logger.info(f"Successfully generated {len(recommendations['recommendations'])} recommendations")
        return jsonify(recommendations)
        
    except Exception as e:
        logger.error(f"Error in recommend endpoint: {e}")
        return jsonify({"error": "An error occurred while processing your request"}), 500

@app.route('/api/search', methods=['GET'])
def search_movies():
    """API endpoint for searching movie titles (autocomplete)"""
    try:
        query = request.args.get('q', '').strip().lower()
        
        if not query or len(query) < 2:
            return jsonify([])
        
        if movies_data is None:
            return jsonify([])
        
        # Find movies that contain the query string
        matching_movies = movies_data[
            movies_data['title'].str.lower().str.contains(query, na=False)
        ]['title'].tolist()
        
        # Limit to 10 suggestions
        return jsonify(matching_movies[:10])
        
    except Exception as e:
        logger.error(f"Error in search endpoint: {e}")
        return jsonify([])

@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Movie Recommendation System API is running!"})

if __name__ == '__main__':
    print("🎬 CinemaAI Movie Recommendation System")
    print("=" * 40)
    print("Loading movie data...")
    
    if load_and_process_data():
        print("✅ Data loaded successfully!")
        print("🚀 Starting Flask server...")
        print("🌐 Access the app at: http://localhost:5000")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("❌ Failed to load data. Please check if movies.csv exists.")