# Echoes of Wisdom - 100 Famous Quotes Web App

A clean, responsive web application built with **Python Flask**, **plain vanilla JavaScript**, and **HTML5/CSS3** to browse and discover 100 well-known quotes with real-time search and filtering.

## Features

- **100 Curated Well-Known Quotes**: Across 10 categories (Philosophy, Science, Literature, Leadership, Art & Creativity, Motivation, Wisdom, Humor, Technology, Life) and 70+ iconic historical figures.
- **Random Quote Hero**: Discover a new random quote with a single click, copy it formatted to your clipboard, or listen to it via speech synthesis.
- **Fast Search**: Instant, debounced search across quote texts and author names.
- **Dynamic Category & Author Filtering**: Filter by category pills or dropdowns, with auto-updated counts.
- **Interactive Quote Cards**: Click any author or category tag on a card to immediately filter the view.
- **Pure Vanilla Stack**: Zero external frontend dependencies, frameworks, or bundlers.

## Project Structure

```
quote-app/
├── data/
│   └── quotes.json            # 100 curated quotes dataset
├── static/
│   ├── css/
│   │   └── style.css          # Modern dark-mode responsive stylesheet
│   └── js/
│       └── app.js             # Vanilla JS state, API fetch, DOM manipulation
├── templates/
│   └── index.html             # Semantic HTML5 template
├── app.py                     # Flask application and REST API endpoints
├── test_app.py                # Automated unit tests using Python unittest
├── requirements.txt           # Dependencies
└── README.md
```

## Running the Application

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python3 app.py
```
By default, the server will listen on `http://127.0.0.1:5000` (or `http://0.0.0.0:5000`).

To run on a different port (e.g. 8080 for Cloud Shell web preview):
```bash
PORT=8080 python3 app.py
```

### 3. Open in Browser
Navigate to `http://127.0.0.1:5000` in your web browser.

## API Reference

| Endpoint | Method | Description | Parameters |
|---|---|---|---|
| `/` | `GET` | Main Web Application UI | None |
| `/api/quotes/random` | `GET` | Returns a random quote | `category`, `author` (optional) |
| `/api/quotes` | `GET` | Search and filter quotes | `q` (search term), `category`, `author` |
| `/api/categories` | `GET` | List categories and quote counts | None |
| `/api/authors` | `GET` | List authors and quote counts | None |

## Running Tests

Run the test suite using Python's built-in `unittest`:
```bash
python3 -m unittest test_app.py -v
```
