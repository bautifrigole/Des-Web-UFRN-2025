const API_KEY = ''; // I'll not put my api here ;)
const stocks = [
    { name: "Apple Inc.", ticker: "AAPL" },
    { name: "Amazon.com", ticker: "AMZN" },
    { name: "Google LLC", ticker: "GOOGL" },
    { name: "Meta Platforms", ticker: "META" },
    { name: "Tesla Inc.", ticker: "TSLA" },
    { name: "Motorola Solutions Inc.", ticker: "MSI" } 
];

const accordion = document.querySelector('.accordion');
const accordionContent = document.getElementById('global-stocks-container');

accordion.addEventListener('click', () => {
    accordion.classList.toggle('active');
    accordionContent.classList.toggle('show');
});

// I'm not sure if we can explore recommendations from this API. Run away from alpha vantage (SCAM)
// Reference --> https://finnhub.io/docs/api/introduction
async function fetchStockPrice(ticker) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`);
        const data = await response.json();
        return data.c; 
    } catch (error) {
        console.error(`Erro ao buscar preço de ${ticker}:`, error);
        return null;
    }
}

async function renderGlobalStocks() {
    accordionContent.innerHTML = "";
    for (const stock of stocks) {
        const price = await fetchStockPrice(stock.ticker);

        const card = document.createElement('div');
        card.classList.add('stock-card');

        card.innerHTML = `
            <h4>${stock.name}</h4>
            <p><strong>${stock.ticker}</strong></p>
            <p>Price: ${price !== null ? price.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }) : 'N/A'}</p>
        `;

        accordionContent.appendChild(card);
    }
}

renderGlobalStocks();
