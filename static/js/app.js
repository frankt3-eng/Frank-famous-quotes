/**
 * Famous Quotes Web Application
 * Plain Vanilla JavaScript implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  const state = {
    currentHeroQuote: null,
    searchQuery: '',
    selectedCategory: '',
    selectedAuthor: '',
    categories: [],
    authors: [],
    quotes: []
  };

  // DOM Elements
  const heroQuoteText = document.getElementById('heroQuoteText');
  const heroQuoteAuthor = document.getElementById('heroQuoteAuthor');
  const heroQuoteCategory = document.getElementById('heroQuoteCategory');
  const btnNewRandom = document.getElementById('btnNewRandom');
  const btnCopyRandom = document.getElementById('btnCopyRandom');
  const btnSpeakQuote = document.getElementById('btnSpeakQuote');

  const searchInput = document.getElementById('searchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  const authorFilter = document.getElementById('authorFilter');
  const btnResetFilters = document.getElementById('btnResetFilters');
  const btnEmptyReset = document.getElementById('btnEmptyReset');
  const categoryPills = document.getElementById('categoryPills');

  const quotesGrid = document.getElementById('quotesGrid');
  const resultsCount = document.getElementById('resultsCount');
  const emptyState = document.getElementById('emptyState');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  let searchDebounceTimer = null;
  let toastTimer = null;

  // Initialize
  init();

  async function init() {
    setupEventListeners();
    await Promise.all([
      fetchCategories(),
      fetchAuthors(),
      fetchRandomQuote()
    ]);
    await fetchQuotes();
  }

  // Event Listeners
  function setupEventListeners() {
    // Hero Actions
    btnNewRandom.addEventListener('click', () => {
      fetchRandomQuote(state.selectedCategory, state.selectedAuthor);
    });

    btnCopyRandom.addEventListener('click', () => {
      if (state.currentHeroQuote) {
        copyQuoteToClipboard(state.currentHeroQuote);
      }
    });

    btnSpeakQuote.addEventListener('click', () => {
      if (state.currentHeroQuote) {
        speakQuote(state.currentHeroQuote);
      }
    });

    // Search Input (Debounced)
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      btnClearSearch.classList.toggle('hidden', state.searchQuery.length === 0);
      
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        fetchQuotes();
      }, 250);
    });

    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      btnClearSearch.classList.add('hidden');
      fetchQuotes();
    });

    // Filters
    categoryFilter.addEventListener('change', (e) => {
      setCategoryFilter(e.target.value);
    });

    authorFilter.addEventListener('change', (e) => {
      state.selectedAuthor = e.target.value;
      fetchQuotes();
    });

    btnResetFilters.addEventListener('click', resetAllFilters);
    btnEmptyReset.addEventListener('click', resetAllFilters);

    // Hero category pill click
    heroQuoteCategory.addEventListener('click', () => {
      if (state.currentHeroQuote && state.currentHeroQuote.category) {
        setCategoryFilter(state.currentHeroQuote.category);
      }
    });
  }

  // Fetch Random Quote from API
  async function fetchRandomQuote(category = '', author = '') {
    heroQuoteText.style.opacity = '0.4';
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (author) params.append('author', author);

      const res = await fetch(`/api/quotes/random?${params.toString()}`);
      if (!res.ok) {
        // If filtered random fails, fallback to any random quote
        const fallbackRes = await fetch('/api/quotes/random');
        const fallbackData = await fallbackRes.json();
        updateHeroUI(fallbackData.quote);
        return;
      }
      const data = await res.json();
      updateHeroUI(data.quote);
    } catch (err) {
      console.error('Failed to fetch random quote:', err);
      heroQuoteText.textContent = 'Could not load quote. Please try again.';
      heroQuoteText.style.opacity = '1';
    }
  }

  function updateHeroUI(quote) {
    state.currentHeroQuote = quote;
    heroQuoteText.textContent = `“${quote.quote}”`;
    heroQuoteAuthor.textContent = `— ${quote.author}`;
    heroQuoteCategory.textContent = quote.category;
    heroQuoteText.style.opacity = '1';
  }

  // Fetch Categories
  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      state.categories = data.categories || [];
      renderCategoryOptions();
      renderCategoryPills();
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  function renderCategoryOptions() {
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    state.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.name;
      option.textContent = `${cat.name} (${cat.count})`;
      categoryFilter.appendChild(option);
    });
  }

  function renderCategoryPills() {
    categoryPills.innerHTML = '';

    // "All" pill
    const allPill = document.createElement('button');
    allPill.className = `pill-btn ${state.selectedCategory === '' ? 'active' : ''}`;
    allPill.textContent = 'All Categories';
    allPill.addEventListener('click', () => setCategoryFilter(''));
    categoryPills.appendChild(allPill);

    state.categories.forEach(cat => {
      const pill = document.createElement('button');
      pill.className = `pill-btn ${state.selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 'active' : ''}`;
      pill.textContent = cat.name;
      pill.addEventListener('click', () => setCategoryFilter(cat.name));
      categoryPills.appendChild(pill);
    });
  }

  // Fetch Authors
  async function fetchAuthors() {
    try {
      const res = await fetch('/api/authors');
      const data = await res.json();
      state.authors = data.authors || [];
      renderAuthorOptions();
    } catch (err) {
      console.error('Failed to load authors:', err);
    }
  }

  function renderAuthorOptions() {
    authorFilter.innerHTML = '<option value="">All Authors</option>';
    state.authors.forEach(auth => {
      const option = document.createElement('option');
      option.value = auth.name;
      option.textContent = `${auth.name} (${auth.count})`;
      authorFilter.appendChild(option);
    });
  }

  // Fetch Quotes based on Active Filters
  async function fetchQuotes() {
    try {
      const params = new URLSearchParams();
      if (state.searchQuery) params.append('q', state.searchQuery);
      if (state.selectedCategory) params.append('category', state.selectedCategory);
      if (state.selectedAuthor) params.append('author', state.selectedAuthor);

      const res = await fetch(`/api/quotes?${params.toString()}`);
      const data = await res.json();
      state.quotes = data.quotes || [];

      renderQuotesGrid(state.quotes, data.total);
    } catch (err) {
      console.error('Failed to search quotes:', err);
    }
  }

  // Render Grid
  function renderQuotesGrid(quotes, total) {
    resultsCount.textContent = `Showing ${total} quote${total === 1 ? '' : 's'}`;

    if (!quotes || quotes.length === 0) {
      quotesGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    quotesGrid.innerHTML = '';

    quotes.forEach(item => {
      const card = document.createElement('article');
      card.className = 'quote-card';

      card.innerHTML = `
        <div class="card-body">
          <p class="card-quote-text">“${escapeHtml(item.quote)}”</p>
          <div class="card-author" title="Filter by this author">— ${escapeHtml(item.author)}</div>
        </div>
        <div class="card-footer">
          <span class="card-category" title="Filter by this category">${escapeHtml(item.category)}</span>
          <button class="card-copy-btn" title="Copy quote">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      `;

      // Card interactions
      const authorElem = card.querySelector('.card-author');
      authorElem.addEventListener('click', () => {
        setAuthorFilter(item.author);
      });

      const categoryElem = card.querySelector('.card-category');
      categoryElem.addEventListener('click', () => {
        setCategoryFilter(item.category);
      });

      const copyBtn = card.querySelector('.card-copy-btn');
      copyBtn.addEventListener('click', () => {
        copyQuoteToClipboard(item);
      });

      quotesGrid.appendChild(card);
    });
  }

  function setCategoryFilter(category) {
    state.selectedCategory = category;
    categoryFilter.value = category;
    renderCategoryPills();
    fetchQuotes();
  }

  function setAuthorFilter(author) {
    state.selectedAuthor = author;
    authorFilter.value = author;
    fetchQuotes();
    // Scroll to top of catalog
    quotesGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function resetAllFilters() {
    state.searchQuery = '';
    state.selectedCategory = '';
    state.selectedAuthor = '';
    searchInput.value = '';
    categoryFilter.value = '';
    authorFilter.value = '';
    btnClearSearch.classList.add('hidden');
    renderCategoryPills();
    fetchQuotes();
  }

  // Clipboard Helper
  function copyQuoteToClipboard(quoteObj) {
    const text = `"${quoteObj.quote}" — ${quoteObj.author} [${quoteObj.category}]`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Quote copied to clipboard!');
      }).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Quote copied to clipboard!');
    } catch (err) {
      showToast('Could not copy to clipboard');
    }
    document.body.removeChild(textArea);
  }

  // Text to Speech
  function speakQuote(quoteObj) {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel(); // Stop any active speech
    const utterance = new SpeechSynthesisUtterance(`"${quoteObj.quote}" by ${quoteObj.author}`);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    showToast('Reading quote aloud...');
  }

  // Toast Notification
  function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // Utility to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
