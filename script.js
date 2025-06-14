// API endpoints for quotes
const API_ENDPOINTS = {
    quoteGarden: 'https://quote-garden.onrender.com/api/v3/quotes/random',
    typeFit: 'https://api.quotable.io/random'
};

// Local fallback quotes
const LOCAL_QUOTES = {
    all: [
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
        { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" }
    ],
    success: [
        { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" }
    ],
    life: [
        { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
        { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" }
    ],
    fitness: [
        { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
        { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Unknown" }
    ]
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
        // Try each API endpoint until we get a successful response
        for (const endpoint of Object.values(API_ENDPOINTS)) {
            try {
                const response = await fetch(endpoint, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    console.log(`API response status: ${response.status}`);
                    continue;
                }

                const data = await response.json();
                
                // Handle different API response formats
                let quote = null;
                if (endpoint === API_ENDPOINTS.quoteGarden) {
                    quote = data.data && data.data[0];
                } else if (endpoint === API_ENDPOINTS.typeFit) {
                    quote = data;
                }

                if (quote) {
                    // Normalize the quote data
                    const normalizedQuote = {
                        text: quote.quote || quote.content || quote.text || quote.body || 'Unknown quote',
                        author: quote.author || quote.author || quote.author || quote.author_name || 'Unknown author'
                    };

                    // Add to cache
                    if (quoteCache[category]) {
                        quoteCache[category].push(normalizedQuote);
                    }

                    return normalizedQuote;
                }
            } catch (error) {
                console.error(`Error fetching from ${endpoint}:`, error);
            }
        }
        
        // If all APIs fail, fall back to local quotes
        const localQuotes = LOCAL_QUOTES[category] || LOCAL_QUOTES.all;
        const randomIndex = Math.floor(Math.random() * localQuotes.length);
        return localQuotes[randomIndex];
    } catch (error) {
        console.error('Error fetching quote:', error);
        // Return a default quote if all APIs fail
        return {
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs"
        };
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
    console.log('New quote button clicked');
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    console.log('Active category:', activeCategory);
    const quote = await getQuote(activeCategory);
    console.log('Received quote:', quote);
    showQuote(quote);
});

// Add debug logging to the showQuote function
function showQuote(quote) {
    console.log('Showing quote:', quote);
    if (quote) {
        quoteText.textContent = quote.text;
        quoteAuthor.textContent = `- ${quote.author}`;
    }
}

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
