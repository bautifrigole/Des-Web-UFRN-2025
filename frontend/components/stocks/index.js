const API_KEY = ''; // I'll not put my api here ;)
// const stocks = [
//     { name: "Apple Inc.", ticker: "AAPL" },
//     { name: "Amazon.com", ticker: "AMZN" },
//     { name: "Google LLC", ticker: "GOOGL" },
//     { name: "Meta Platforms", ticker: "META" },
//     { name: "Tesla Inc.", ticker: "TSLA" },
//     { name: "Motorola Solutions Inc.", ticker: "MSI" }
// ];

const accordion = document.querySelector('.accordion');
const accordionContent = document.getElementById('global-stocks-container');
accordion.classList.toggle('active');
accordionContent.classList.toggle('show');

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

async function fetchHistoricalStockPrice(ticker, purchaseDate) {

    try {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        const formattedToday = today.toISOString().split('T')[0];
        const formattedOneYearAgo = oneYearAgo.toISOString().split('T')[0];
        const API_KEY = '';
        const response = await fetch(`http://api.marketstack.com/v1/eod?access_key=${API_KEY}&symbols=${'GOOGL'}&date_from=${formattedOneYearAgo}&date_to=${formattedToday}&limit=365`);

        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0].close;
        } else {
            console.warn(`Could not find historical price for ${ticker} on the specified date.`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching historical price for ${ticker}:`, error);
        return null;
    }
}

async function renderGlobalStocks() {
    const token = localStorage.getItem('token');
    const res = await fetch('/stocks', {
        method: 'GET',
        headers: {
            'token': token
        }
    });

    const stocks = await res.json()
    console.log("STOCK INVESTED ===>", stocks)
    accordionContent.innerHTML = "";

    const groupedStocks = stocks.stocks.reduce((acc, stock) => {
        if (!acc[stock.stock_code]) {
            acc[stock.stock_code] = [];
        }
        acc[stock.stock_code].push(stock);
        return acc;
    }, {});

    for (const [stock_code, stockList] of Object.entries(groupedStocks)) {
        const currentPrice = await fetchStockPrice(stock_code);

        const totalShares = stockList.length;
        const totalCost = stockList.reduce((sum, stock) => sum + stock.price, 0);
        const avgPurchasePrice = totalCost / totalShares;

        const totalProfit = currentPrice !== null
            ? (currentPrice - avgPurchasePrice) * totalShares
            : null;

        const profitLossPercent = currentPrice !== null
            ? ((currentPrice - avgPurchasePrice) / avgPurchasePrice) * 100
            : null;

        const card = document.createElement('div');
        card.classList.add('stock-card');
        const color = profitLossPercent === null ? 'gray' : profitLossPercent >= 0 ? 'green' : 'red';

        let indicatorClass = '';
        let triangleIcon = '';

        if (profitLossPercent >= 0) {
            indicatorClass = 'profit';
            triangleIcon = '▲';
        } else {
            indicatorClass = 'loss';
            triangleIcon = '▼';
        }

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
                    <span class="ml-2">
                        ${triangleIcon}
                        ${profitLossPercent !== null ? profitLossPercent.toFixed(2) + '%' : ''}
                    </span>
                </div>
            </div>
        `;

        accordionContent.appendChild(card);
    }

    // for (const stock of uniqueStocks) {
    //     const price = await fetchStockPrice(stock);
    //     console.log("PRICE ==>", price)

    //     const card = document.createElement('div');
    //     card.classList.add('stock-card');

    //     card.innerHTML = `
    //         <h4><strong>${stock.stock_code}<strong/> </h4>
    //         <p> ${price !== null ? price.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }) : 'N/A'}</p>
    //     `;

    //     accordionContent.appendChild(card);
    // }
}

renderGlobalStocks();
// fetchHistoricalStockPrice();


const STOCKS = [
    { name: "Apple Inc.", ticker: "AAPL", basePrice: 180, volatility: 0.3 },
    { name: "Amazon.com", ticker: "AMZN", basePrice: 175, volatility: 0.4 },
    { name: "Google LLC", ticker: "GOOGL", basePrice: 170, volatility: 0.25 },
    { name: "Meta Platforms", ticker: "META", basePrice: 450, volatility: 0.6 },
    { name: "Tesla Inc.", ticker: "TSLA", basePrice: 180, volatility: 1.2 },
    { name: "Motorola Solutions Inc.", ticker: "MSI", basePrice: 350, volatility: 0.2 }
];
// MOCK
function generateMockDataForStock(ticker, basePrice, volatility) {
    const data = [];
    const today = new Date();
    let currentPrice = basePrice;

    for (let i = 365; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const changePercent = (Math.random() - 0.48) * volatility;
        const changeAmount = currentPrice * changePercent / 100;
        currentPrice += changeAmount;

        if (currentPrice < 0) {
            currentPrice = basePrice * 0.1;
        }

        const open = currentPrice * (1 + (Math.random() - 0.5) * 0.02);
        const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.02);
        const low = Math.min(open, currentPrice) * (1 - Math.random() * 0.02);

        data.push({
            symbol: ticker,
            date: date.toISOString(),
            close: parseFloat(currentPrice.toFixed(2)),
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
        });
    }
    return data;
}

const MOCK_DATABASE = {};
STOCKS.forEach(stock => {
    MOCK_DATABASE[stock.ticker] = generateMockDataForStock(stock.ticker, stock.basePrice, stock.volatility);
});

// Filter
const timeSelectorButtons = document.querySelectorAll(".time-selector button");
const chartCanvas = document.getElementById('stockChart');
let myChart = null;


function filterDataByPeriod(period) {
    const today = new Date();
    const startDate = new Date();

    switch (period) {
        case '1M':
            startDate.setMonth(today.getMonth() - 1);
            break;
        case '3M':
            startDate.setMonth(today.getMonth() - 3);
            break;
        case '6M':
            startDate.setMonth(today.getMonth() - 6);
            break;
        case '1Y':
        default:
            startDate.setFullYear(today.getFullYear() - 1);
            break;
    }

    const filteredDatabase = {};
    for (const ticker in MOCK_DATABASE) {
        filteredDatabase[ticker] = MOCK_DATABASE[ticker].filter(day => {
            const dayDate = new Date(day.date);
            return dayDate >= startDate && dayDate <= today;
        });
    }
    return filteredDatabase;
}

// Chart is managed here.
async function updateChart(period) {
    const filteredData = filterDataByPeriod(period);
    const datasets = [];
    let labels = [];

    const lineColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    const total = getAmount(STOCKS);

    const card_stock = document.getElementById('total-stocks');
    const card_amount = document.getElementById('total-amount');

    if (card_stock) {
        card_stock.textContent = STOCKS.length;
        card_amount.textContent = '$' + total;
    }

    STOCKS.forEach((stock, index) => {
        const stockData = filteredData[stock.ticker];
        if (!stockData || stockData.length === 0) return;

        const startPrice = stockData[0].close;
        const performanceData = stockData.map(day => {
            return ((day.close / startPrice) - 1) * 100;
        });

        datasets.push({
            label: stock.ticker,
            data: performanceData,
            borderColor: lineColors[index % lineColors.length],
            fill: false,
            tension: 0.1,
            pointRadius: 0,
        });
    });

    if (filteredData[STOCKS[0].ticker]) {
        labels = filteredData[STOCKS[0].ticker].map(day => new Date(day.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }));
    }

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: `Relative Stock Performance (%) - Período: ${period}` },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${parseFloat(context.raw).toFixed(2)}%`;
                        }
                    }
                },
            },
            scales: {
                y: {
                    title: { display: true, text: 'Crescimento (%)' },
                    ticks: { callback: value => `${value}%` }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
        }
    });
}

const periodSelect = document.getElementById('period-select');
periodSelect.addEventListener('change', (event) => {
    const selectedPeriod = event.target.value;
    updateChart(selectedPeriod);
});

function initializeChart() {
    const initialPeriod = periodSelect.value;
    updateChart(initialPeriod);
}
initializeChart();
// document.querySelector('[data-period="1Y"]').click();

// I created these functions for wallet cards 

function getAmount(stocks) {
    const totalSum = stocks.reduce((accumulator, currentStock) => accumulator + currentStock.basePrice, 0);
    return totalSum
}

async function getInvested() {
    const token = localStorage.getItem('token');
    try {
        const stocks = await fetch('/stocks', {
            method: 'GET',
            headers: {
                'token': token
            }
        });

        console.log("RETURNED STOCKS ===>", stocks);
    } catch (error) {
        console.log("Error fetching stocks: ", error)
    }
}


document.addEventListener('DOMContentLoaded', async function () {
    // const stocks = await getInvested();
    try {
        const token = localStorage.getItem('token');
        const stocks = await fetch('/stocks', {
            method: 'GET',
            headers: {
                'token': token
            }
        });
        const data = await stocks.json();
        const invested = data.stocks.reduce((acc, stock) => acc + stock.price, 0)

        const card_invested = document.getElementById('total-invested');
        const card_balance = document.getElementById('total-balance');
        const total = getAmount(STOCKS);

        if (card_invested) {
            card_invested.textContent = '$' + invested;
            formatText(card_balance, invested, total)
            // card_balance.textContent = '$' + (total - invested);
        }

    } catch (error) {
        console.log("ERROR", error)
    }
});


function formatText(card_balance, invested, total) {
    const arrowUpIcon = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
    </svg>
`;

    const arrowDownIcon = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
    </svg>
`;
    const balance = total - invested;

    let balanceColorClass = '';
    let balanceIcon = '';
    let sign = '';

    if (balance >= 0) {
        balanceColorClass = 'text-green-600';
        balanceIcon = arrowUpIcon;
        sign = '+';
    } else {
        balanceColorClass = 'text-red-600';
        balanceIcon = arrowDownIcon;
        sign = '';
    }

    const formattedBalance = Math.abs(balance).toFixed(2);

    const balanceHTML = `
        <div class="flex items-center font-bold ${balanceColorClass}">
            <span class="ml-1">${sign} 
            $${formattedBalance}</span>
        </div>
    `;

    card_balance.innerHTML = balanceHTML;
}