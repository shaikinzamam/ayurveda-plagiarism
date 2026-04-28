# AyurCheck AI

A simple local plagiarism detection tool for Ayurvedic research articles.

## Project Structure

```text
backend/
  main.py
  utils.py
  embeddings.py
frontend/
  index.html
  script.js
  style.css
data/
  article1.txt
  article2.txt
  article3.txt
requirements.txt
```

## Install Dependencies

```bash
pip install fastapi uvicorn sentence-transformers faiss-cpu beautifulsoup4 requests numpy
```

Or install from the requirements file:

```bash
pip install -r requirements.txt
```

## Run Backend

From the `backend` folder:

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

## Run Frontend

Open this file in your browser:

```text
frontend/index.html
```

## API

### POST `/check`

Request:

```json
{
  "text": "Ayurvedic article text",
  "url": "https://example.com/article"
}
```

The `url` field is optional. If both `text` and `url` are supplied, the backend checks the combined content.

Response:

```json
{
  "score": 78.5,
  "level": "HIGH",
  "matches": [
    {
      "input_text": "...",
      "matched_text": "...",
      "similarity": 0.785
    }
  ],
  "explanation": "..."
}
```

## How It Works

1. Loads `.txt` files from the `data` folder.
2. Cleans text and splits it into 200-300 word chunks.
3. Creates sentence embeddings using `all-MiniLM-L6-v2`.
4. Stores dataset embeddings in a FAISS cosine similarity index.
5. Compares submitted text or URL content against the dataset.
6. Returns a plagiarism score, risk level, top matches, and a short explanation.
