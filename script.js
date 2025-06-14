// API endpoints for quotes
const API_ENDPOINTS = {
    quoteGarden: 'https://quote-garden.onrender.com/api/v3/quotes/random',
    typeFit: 'https://api.quotable.io/random',
    zenQuotes: 'https://zenquotes.io/api/random'
};

// Categories mapping for API filtering
const CATEGORY_MAPPING = {
    all: ['all', 'any'],
    success: ['success', 'motivation', 'inspiration'],
    life: ['life', 'living'],
    fitness: ['health', 'fitness']
};

// Cache for quotes
const quoteCache = {
    all: [],
    success: [],
    life: [],
    fitness: []
};

// Get DOM elements
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const newQuoteBtn = document.getElementById('new-quote');
const copyQuoteBtn = document.getElementById('copy-quote');
const categoryBtns = document.querySelectorAll('.category-btn');
const themeToggle = document.getElementById('theme-toggle');

// Function to fetch quotes from multiple APIs
async function fetchQuote(category = 'all') {
    try {
        // Choose a random API endpoint
        const endpoints = Object.values(API_ENDPOINTS);
        const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        
        // Make the API request
        const response = await fetch(randomEndpoint);

        if (!response.ok) {
            throw new Error('Failed to fetch quote');
        }

        const data = await response.json();
        
        // Normalize the quote data from different APIs
        let quote = null;
        if (randomEndpoint === API_ENDPOINTS.quoteGarden) {
            quote = data.data[0];
        } else if (randomEndpoint === API_ENDPOINTS.typeFit) {
            quote = data;
        } else if (randomEndpoint === API_ENDPOINTS.zenQuotes) {
            quote = data[0];
        } else if (randomEndpoint === API_ENDPOINTS.dummy) {
            quote = data[0];
        }

        // Add to cache
        if (quote && quoteCache[category]) {
            quoteCache[category].push({
                text: quote.quote || quote.content || quote.text,
                author: quote.author || quote.author || 'Unknown'
            });
        }

        return quote;
    } catch (error) {
        console.error('Error fetching quote:', error);
        // If one API fails, try another
        return fetchQuote(category);
    }
}

// Function to get a random quote from cache or fetch a new one
async function getQuote(category = 'all') {
    const cachedQuotes = quoteCache[category];
    if (cachedQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * cachedQuotes.length);
        return cachedQuotes[randomIndex];
    }
    return fetchQuote(category);
}

// Initialize with a random quote
async function initialize() {
    try {
        const quote = await getQuote('all');
        showQuote(quote);
    } catch (error) {
        console.error('Error initializing:', error);
    }
}

// Show the quote on the page
function showQuote(quote) {
    if (quote) {
        quoteText.textContent = quote.text;
        quoteAuthor.textContent = `- ${quote.author}`;
    }
}

// Add event listeners
newQuoteBtn.addEventListener('click', async () => {
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    const quote = await getQuote(activeCategory);
    showQuote(quote);
});

copyQuoteBtn.addEventListener('click', () => {
    const quote = `${quoteText.textContent}\n- ${quoteAuthor.textContent}`;
    navigator.clipboard.writeText(quote)
        .then(() => {
            copyQuoteBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyQuoteBtn.textContent = 'Copy Quote';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
});

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        // Get new quote for selected category
        getQuote(btn.dataset.category).then(showQuote);
    });
});

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark');
});

// Initialize the application
initialize();
