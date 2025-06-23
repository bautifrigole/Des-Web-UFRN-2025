

const FINNHUB_API_KEY = '';
const MARKETSTACK_API_KEY = '';

const appState = {
    stocks: [],
    historicalData: {},
    chartInstance: null,
    updatedStocks: [],
    totalAmount: 0,
    stocksTotal: 0
};


async function initializeApp() {
    try {
        console.log("Starting...");

        const token = localStorage.getItem('token');
        const response = await fetch('/stocks', {
            method: 'GET',
            headers: { 'token': token }
        });
        if (!response.ok) throw new Error(`Stock fetch failed /stocks: ${response.statusText}`);

        const data = await response.json();
        if (data.stocks === undefined) data.stocks = [];
        
        appState.stocks = data.stocks;
        await renderGlobalStocks();
        renderWalletCards();

        const uniqueStocks = [...new Map(appState.stocks.map(item => [item.stock_code, item])).values()];
        for (const stock of uniqueStocks) {
            appState.historicalData[stock.stock_code] = await fetchStockData(stock.stock_code);
        }

        updateChart(document.getElementById('period-select')?.value || '1Y');
        setupEventListeners();

    } catch (error) {
        console.error("Critical", error);
        const body = document.querySelector('body');
        if (body) body.innerHTML = `<h2 style="color: red; text-align: center; margin-top: 50px;">ERROR: ${error.message}</h2>`;
    }
}

// Starts here
document.addEventListener('DOMContentLoaded', initializeApp);


function setupEventListeners() {
    const accordion = document.querySelector('.accordion');
    const accordionContent = document.getElementById('global-stocks-container');
    if (accordion && accordionContent) {
        accordion.classList.add('active');
        accordionContent.classList.add('show');
        accordion.addEventListener('click', () => {
            accordion.classList.toggle('active');
            accordionContent.classList.toggle('show');
        });
    }

    const periodSelect = document.getElementById('period-select');
    if (periodSelect) {
        periodSelect.addEventListener('change', (event) => {
            updateChart(event.target.value);
        });
    }
}

// If you need to change something in cards, this is where theyy're being rendered.
async function renderGlobalStocks() {
    const accordionContent = document.getElementById('global-stocks-container');
    if (!accordionContent) return;

    accordionContent.innerHTML = "";

    if (appState.stocks.length === 0) {
        accordionContent.innerHTML = '<p style="padding: 1rem; text-align: center;">No stocks found.</p>';
        return;
    }

    const groupedStocks = appState.stocks.reduce((acc, stock) => {
        if (!acc[stock.stock_code]) acc[stock.stock_code] = [];
        acc[stock.stock_code].push(stock);
        return acc;
    }, {});

    const amount = appState.stocks.reduce((acc, stock) => acc + stock.price, 0);
    const pricePromises = appState.stocks.map(stock =>
        fetchStockPrice(stock.stock_code)
    );
 
    const resolvedPrices = await Promise.all(pricePromises);
    const totalAmount = resolvedPrices.reduce((acc, prices) => acc + prices, 0);
    appState.stocksTotal = resolvedPrices.length;
    appState.totalAmount = totalAmount;

    for (const [stock_code, stockList] of Object.entries(groupedStocks)) {
        const currentPrice = await fetchStockPrice(stock_code);
        const totalShares = stockList.length;
        const totalCost = stockList.reduce((sum, stock) => sum + stock.price, 0);
        const avgPurchasePrice = totalCost / totalShares;
        const totalProfit = currentPrice !== null ? (currentPrice - avgPurchasePrice) * totalShares : null;
        const profitLossPercent = currentPrice !== null ? ((currentPrice - avgPurchasePrice) / avgPurchasePrice) * 100 : null;
        const indicatorClass = profitLossPercent >= 0 ? 'profit' : 'loss';
        const triangleIcon = profitLossPercent >= 0 ? '▲' : '▼';

        const card = document.createElement('div');
        card.classList.add('stock-card');
        card.innerHTML = `
            <div class="stock-header">
                <h4>${stock_code}</h4>
                <span>Total: <strong>${totalShares}</strong></span>
            </div>
            <div class="stock-metrics">
                <div class="metric-item">
                    <span class="label">Cost Basis</span>
                    <span class="value">${avgPurchasePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })}</span>
                </div>
                <div class="metric-item">
                    <span class="label">Market Value</span>
                    <span class="value">${currentPrice !== null ? currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }) : 'N/A'}</span>
                </div>
            </div>
            <div class="balance-section">
                <div class="percentage-indicator ${indicatorClass}">
                    <span class="value">${totalProfit !== null ? totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }) : 'N/A'}</span>
                    <span class="ml-2">${triangleIcon} ${profitLossPercent !== null ? profitLossPercent.toFixed(2) + '%' : ''}</span>
                </div>
            </div>`;
        accordionContent.appendChild(card);
    }
}

function updateChart(period) {
    const chartCanvas = document.getElementById('stockChart');
    if (!chartCanvas) return;

    const filteredData = filterDataByPeriod(period);
    const datasets = [];
    let labels = [];

    const lineColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    const uniqueStocks = [...new Map(appState.stocks.map(item => [item.stock_code, item])).values()];

    uniqueStocks.forEach((stock, index) => {
        const stockData = filteredData[stock.stock_code];
        if (!stockData || stockData.length === 0) return;
        const startPrice = stockData[0].close;
        const performanceData = stockData.map(day => ((day.close / startPrice) - 1) * 100);
        datasets.push({
            label: stock.stock_code, data: performanceData,
            borderColor: lineColors[index % lineColors.length],
            fill: false, tension: 0.1, pointRadius: 0,
        });
    });

    if (uniqueStocks.length > 0 && filteredData[uniqueStocks[0].stock_code]) {
        labels = filteredData[uniqueStocks[0].stock_code].map(day => new Date(day.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }));
    }

    if (appState.chartInstance) appState.chartInstance.destroy();

    appState.chartInstance = new Chart(chartCanvas, {
        type: 'line', data: { labels, datasets },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: `Stock Performance (%) - Period: ${period}` },
                tooltip: { mode: 'index', intersect: false, callbacks: { label: (context) => `${context.dataset.label}: ${parseFloat(context.raw).toFixed(2)}%` } },
            },
            scales: {
                y: { title: { display: true, text: 'Profit (%)' }, ticks: { callback: value => `${value}%` } }
            },
            interaction: { mode: 'index', intersect: false },
        }
    });
}

function renderWalletCards() {
    const card_invested = document.getElementById('total-invested');
    const card_balance = document.getElementById('total-balance');
    const card_stock_count = document.getElementById('total-stocks');
    const card_amount = document.getElementById('total-amount');
    if (!card_invested) return;

    const invested = getInvestedAmount();
    const uniqueStocks = [...new Map(appState.stocks.map(item => [item.stock_code, item])).values()];
    const totalCurrentValue = appState.totalAmount;

    card_stock_count.textContent = appState.stocksTotal;
    card_amount.textContent = '$' + totalCurrentValue.toFixed(2);
    card_invested.textContent = '$' + invested.toFixed(2);
    formatText(card_balance, invested, totalCurrentValue);
}


async function fetchStockPrice(ticker) {
    if (!FINNHUB_API_KEY) { console.warn("API_KEY empty. MOCK STARTED"); return null; }
    try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`);
        const data = await response.json();
        return data.c;
    } catch (error) { console.error(`Failed: ${ticker}:`, error); return null; }
}

async function fetchStockData(ticker) {
    if (!MARKETSTACK_API_KEY) {
        const stockInfo = appState.stocks.find(s => s.stock_code === ticker);
        return generateMockDataForStock(ticker, stockInfo?.price || 100, 0.3);
    }

    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const formattedToday = today.toISOString().split('T')[0];
    const formattedOneYearAgo = oneYearAgo.toISOString().split('T')[0];
    const apiUrl = `http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${ticker}&date_from=${formattedOneYearAgo}&date_to=${formattedToday}&limit=365`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.data && data.data.length > 0) return data.data;
        return [];
    } catch (error) { console.error(`Failed: ${ticker}:`, error); return []; }
}

function filterDataByPeriod(period) {
    const today = new Date();
    const startDate = new Date();
    switch (period) {
        case '1M': startDate.setMonth(today.getMonth() - 1); break;
        case '3M': startDate.setMonth(today.getMonth() - 3); break;
        case '6M': startDate.setMonth(today.getMonth() - 6); break;
        case '1Y': default: startDate.setFullYear(today.getFullYear() - 1); break;
    }
    const filteredDatabase = {};
    for (const ticker in appState.historicalData) {
        filteredDatabase[ticker] = appState.historicalData[ticker].filter(day => new Date(day.date) >= startDate && new Date(day.date) <= today);
    }
    return filteredDatabase;
}

function generateMockDataForStock(ticker, basePrice, volatility) {
    const data = [];
    const today = new Date();
    let currentPrice = basePrice;
    for (let i = 365; i >= 0; i--) {
        const date = new Date(today); date.setDate(today.getDate() - i);
        const changePercent = (Math.random() - 0.48) * volatility;
        currentPrice += currentPrice * changePercent / 100;
        data.push({ symbol: ticker, date: date.toISOString(), close: parseFloat(currentPrice.toFixed(2)) });
    }
    return data;
}

function getAmount(stocks) {
    console.log("STOCKS ===>", stocks)
    return stocks.reduce((acc, stock) => acc + (stock.basePrice || stock.price), 0);
}

function getInvestedAmount() {
    return appState.stocks.reduce((acc, stock) => acc + stock.price, 0);
}

function formatText(card_balance, invested, total) {
    const balance = total - invested;
    const balanceColorClass = balance >= 0 ? 'text-green-600' : 'text-red-600';
    const sign = balance >= 0 ? '+' : '';
    card_balance.innerHTML = `<div class="flex items-center font-bold ${balanceColorClass}"><span class="ml-1">${sign} $${Math.abs(balance).toFixed(2)}</span></div>`;
}