# 🎬 CinemaAI - Movie Recommendation System

A beautiful, AI-powered movie recommendation system built with **Python Flask** and modern web technologies.

## ✨ Features

- **Smart Recommendations**: Uses TF-IDF and cosine similarity algorithms to find similar movies
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Auto-complete**: Smart search suggestions as you type
- **Fast & Efficient**: Optimized algorithms for quick movie matching
- **RESTful API**: Clean API endpoints for integration
- **Pure Python**: Built with Flask, pandas, and scikit-learn

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Installation & Setup

1. **Clone or download this project**

2. **Navigate to the project directory**
   ```bash
   cd "Movie Recommendation system"
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask application**
   ```bash
   python app.py
   ```

5. **Open your browser and visit**
   ```
   http://localhost:5000
   ```

## 🎯 How to Use

1. Enter the name of a movie you love in the search box
2. Select how many recommendations you want (5-20)
3. Click "Get Recommendations" or press Enter
4. Discover amazing movies similar to your favorite!

## 🛠️ Technology Stack

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **ML Libraries**: 
  - pandas - Data manipulation
  - scikit-learn - TF-IDF Vectorization & Cosine Similarity
  - difflib - Fuzzy string matching
- **Build Tool**: pip

## 📊 API Endpoints

- `GET /` - Main web interface
- `POST /api/recommend` - Get movie recommendations
- `GET /api/search?q={query}` - Search movie titles (autocomplete)
- `GET /api/health` - Health check

## 🎨 Screenshots

The application features a beautiful gradient background with floating animations, glassmorphism cards, and smooth transitions for an engaging user experience.

## 📁 Project Structure

```
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── movies.csv                  # Movie dataset
├── templates/
│   └── index.html             # HTML template
├── static/
│   ├── style.css              # CSS styling
│   └── script.js              # JavaScript functionality
└── README.md                  # Project documentation
```

## 🐍 Python Dependencies

- **Flask**: Web framework for creating the API and serving templates
- **pandas**: Data manipulation and CSV reading
- **scikit-learn**: Machine learning algorithms (TF-IDF, cosine similarity)
- **difflib2**: Enhanced fuzzy string matching for movie title search
- **gunicorn**: Production WSGI server (optional)

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy discovering your next favorite movie! 🍿**