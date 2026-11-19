import json
import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app import app, DATA_PATH

class QuoteAppTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        self.app.config["TESTING"] = True

    def test_quotes_dataset_integrity(self):
        """Verify quotes.json contains exactly 100 well-formed quotes."""
        self.assertTrue(os.path.exists(DATA_PATH), "quotes.json file must exist")
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertEqual(len(data), 100, "Dataset must have exactly 100 quotes")

        ids = set()
        for idx, item in enumerate(data):
            self.assertIn("id", item, f"Quote #{idx} missing 'id'")
            self.assertIn("quote", item, f"Quote #{idx} missing 'quote'")
            self.assertIn("author", item, f"Quote #{idx} missing 'author'")
            self.assertIn("category", item, f"Quote #{idx} missing 'category'")
            self.assertTrue(len(item["quote"].strip()) > 0, f"Quote #{idx} empty quote string")
            self.assertTrue(len(item["author"].strip()) > 0, f"Quote #{idx} empty author string")
            self.assertTrue(len(item["category"].strip()) > 0, f"Quote #{idx} empty category string")
            ids.add(item["id"])

        self.assertEqual(len(ids), 100, "All quote IDs must be unique")

    def test_index_page(self):
        """Verify the root page renders HTML correctly."""
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Echoes of Wisdom", res.data)
        self.assertIn(b"Random Quote", res.data)
        self.assertIn(b"searchInput", res.data)

    def test_random_quote(self):
        """Verify /api/quotes/random returns a valid quote."""
        res = self.client.get("/api/quotes/random")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("quote", data)
        self.assertIn("author", data["quote"])
        self.assertIn("category", data["quote"])

    def test_random_quote_filtered(self):
        """Verify /api/quotes/random with category filter."""
        res = self.client.get("/api/quotes/random?category=Science")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["quote"]["category"], "Science")

    def test_random_quote_not_found(self):
        """Verify /api/quotes/random returns 404 for nonexistent criteria."""
        res = self.client.get("/api/quotes/random?category=NonExistentCategoryXYZ")
        self.assertEqual(res.status_code, 404)
        data = res.get_json()
        self.assertIn("error", data)

    def test_get_all_quotes(self):
        """Verify /api/quotes returns 100 quotes by default."""
        res = self.client.get("/api/quotes")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["total"], 100)
        self.assertEqual(len(data["quotes"]), 100)

    def test_search_by_author(self):
        """Verify /api/quotes?author=Socrates."""
        res = self.client.get("/api/quotes?author=Socrates")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreater(data["total"], 0)
        for q in data["quotes"]:
            self.assertIn("socrates", q["author"].lower())

    def test_search_by_category(self):
        """Verify /api/quotes?category=Philosophy."""
        res = self.client.get("/api/quotes?category=Philosophy")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreater(data["total"], 0)
        for q in data["quotes"]:
            self.assertEqual(q["category"].lower(), "philosophy")

    def test_search_by_query_keyword(self):
        """Verify /api/quotes?q=wisdom."""
        res = self.client.get("/api/quotes?q=wisdom")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreater(data["total"], 0)
        for q in data["quotes"]:
            matches = (
                "wisdom" in q["quote"].lower()
                or "wisdom" in q["author"].lower()
                or "wisdom" in q["category"].lower()
            )
            self.assertTrue(matches)

    def test_categories_endpoint(self):
        """Verify /api/categories returns a list of categories with counts."""
        res = self.client.get("/api/categories")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("categories", data)
        self.assertGreater(len(data["categories"]), 0)
        total_counted = sum(c["count"] for c in data["categories"])
        self.assertEqual(total_counted, 100)

    def test_authors_endpoint(self):
        """Verify /api/authors returns a list of authors with counts."""
        res = self.client.get("/api/authors")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("authors", data)
        self.assertGreater(len(data["authors"]), 0)
        total_counted = sum(a["count"] for a in data["authors"])
        self.assertEqual(total_counted, 100)

    def test_static_assets(self):
        """Verify static CSS and JavaScript files are served properly."""
        with self.client.get("/static/css/style.css") as css_res:
            self.assertEqual(css_res.status_code, 200)
            self.assertIn(b"hero-card", css_res.data)

        with self.client.get("/static/js/app.js") as js_res:
            self.assertEqual(js_res.status_code, 200)
            self.assertIn(b"fetchRandomQuote", js_res.data)

if __name__ == "__main__":
    unittest.main()
