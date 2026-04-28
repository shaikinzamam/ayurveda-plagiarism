const API_URL = "http://127.0.0.1:8000/check";
const HIGHLIGHT_TERMS = ["Vata", "Ama", "herbal", "arthritis"];

const articleText = document.getElementById("articleText");
const articleUrl = document.getElementById("articleUrl");
const checkButton = document.getElementById("checkButton");
const buttonText = document.getElementById("buttonText");
const spinner = document.getElementById("spinner");
const statusText = document.getElementById("status");
const result = document.getElementById("result");
const score = document.getElementById("score");
const level = document.getElementById("level");
const progressBar = document.getElementById("progressBar");
const explanation = document.getElementById("explanation");
const matches = document.getElementById("matches");
const matchCount = document.getElementById("matchCount");

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.className = isError ? "status error" : "status";
}

function setLoading(isLoading) {
  checkButton.disabled = isLoading;
  buttonText.textContent = isLoading ? "Processing..." : "Check Plagiarism";
  spinner.classList.toggle("hidden", !isLoading);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlightTerms(value) {
  let safeText = escapeHtml(value);

  HIGHLIGHT_TERMS.forEach((term) => {
    const pattern = new RegExp(`\\b(${term})\\b`, "gi");
    safeText = safeText.replace(pattern, '<mark>$1</mark>');
  });

  return safeText;
}

function friendlyError(error) {
  if (error.message.includes("Failed to fetch")) {
    return "Could not reach the backend. Start FastAPI with uvicorn and try again.";
  }
  if (error.message.length > 160) {
    return "Something went wrong while checking the article. Please verify the input and try again.";
  }
  return error.message;
}

function renderLevel(levelValue) {
  level.textContent = levelValue;
  level.className = `levelBadge ${levelValue.toLowerCase()}`;
}

function renderMatches(items) {
  matches.innerHTML = "";
  matchCount.textContent = `${items.length} found`;

  if (!items.length) {
    matches.innerHTML = '<p class="empty">No close matches were found in the local dataset.</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "matchCard";

    card.innerHTML = `
      <div class="matchMeta">
        <strong>${Math.round(item.similarity * 100)}% similar</strong>
        <span>${escapeHtml(item.match_type || "Similarity Match")}</span>
      </div>
      <p class="matchedText">${highlightTerms(item.matched_text)}</p>
      <details>
        <summary>Input chunk</summary>
        <p>${highlightTerms(item.input_text)}</p>
      </details>
    `;

    matches.appendChild(card);
  });
}

checkButton.addEventListener("click", async () => {
  const text = articleText.value.trim();
  const url = articleUrl.value.trim();

  if (!text && !url) {
    setStatus("Please enter article text or a URL.", true);
    return;
  }

  setLoading(true);
  setStatus("Analyzing semantic similarity across Ayurvedic research chunks...");
  result.classList.add("hidden");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, url: url || null }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to check plagiarism right now.");
    }

    const scoreValue = Number(data.score || 0);
    score.textContent = `${scoreValue.toFixed(2)}%`;
    progressBar.style.width = `${Math.min(scoreValue, 100)}%`;
    progressBar.className = `progressBar ${data.level.toLowerCase()}`;
    renderLevel(data.level);
    explanation.innerHTML = highlightTerms(data.explanation || "");
    renderMatches(data.matches || []);

    result.classList.remove("hidden");
    setStatus("Analysis complete.");
  } catch (error) {
    setStatus(friendlyError(error), true);
  } finally {
    setLoading(false);
  }
});
