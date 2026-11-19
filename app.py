import os
import json
import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "quotes.json")

def load_quotes():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

QUOTES = load_quotes()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/quotes/random", methods=["GET"])
def get_random_quote():
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    pool = QUOTES
    if category:
        pool = [q for q in pool if q["category"].lower() == category]
    if author:
        pool = [q for q in pool if author in q["author"].lower()]

    if not pool:
        return jsonify({"error": "No quotes found matching the specified criteria."}), 404

    selected = random.choice(pool)
    return jsonify({"quote": selected})

@app.route("/api/quotes", methods=["GET"])
def get_quotes():
    query = request.args.get("q", "").strip().lower()
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    results = QUOTES

    if category:
        results = [q for q in results if q["category"].lower() == category]

    if author:
        results = [q for q in results if author in q["author"].lower()]

    if query:
        results = [
            q for q in results
            if query in q["quote"].lower() or query in q["author"].lower() or query in q["category"].lower()
        ]

    return jsonify({
        "total": len(results),
        "quotes": results
    })

@app.route("/api/categories", methods=["GET"])
def get_categories():
    counts = {}
    for q in QUOTES:
        cat = q["category"]
        counts[cat] = counts.get(cat, 0) + 1

    categories = [
        {"name": cat, "count": count}
        for cat, count in sorted(counts.items())
    ]
    return jsonify({"categories": categories})

@app.route("/api/authors", methods=["GET"])
def get_authors():
    counts = {}
    for q in QUOTES:
        auth = q["author"]
        counts[auth] = counts.get(auth, 0) + 1

    authors = [
        {"name": auth, "count": count}
        for auth, count in sorted(counts.items())
    ]
    return jsonify({"authors": authors})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    print(f"Starting Quote App on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug)
