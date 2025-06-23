document.addEventListener('DOMContentLoaded', async function () {

    const token = localStorage.getItem('token');
    const welcomeText = document.getElementsByTagName('h1')[0];
    const dashboardText = document.getElementsByClassName('dashboard-data')[0];

    if (!token) return;

    try {
        const res = await fetch('/user', {
            method: 'GET',
            headers: {
                'token': token
            }
        });

        if (res.ok) {
            const data = await res.json();
            welcomeText.textContent = `Welcome to your dashboard, ${data.user.first_name}!`;
        }

        const resExpenses = await fetch('/get-expenses', {
            method: 'GET',
            headers: {
                'token': token
            }
        });

        const resIncomes = await fetch('/get-incomes', {
            method: 'GET',
            headers: {
                'token': token
            }
        });

        if (resExpenses.ok && resIncomes.ok) {
            const expensesData = await resExpenses.json();
            const incomesData = await resIncomes.json();

            addStats(incomesData, expensesData);
            renderMonthlyChart(incomesData, expensesData);
            renderExpenseDoughnutChart(incomesData, expensesData);
            addRecentTransactions(incomesData, expensesData);
            
        } else {
            dashboardText.textContent = 'Unfortunately, you do not have any data registered yet.';
        }
    } catch (err) {
        console.error('Error getting user information:', err);
    }

});

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    function addStats(incomesData, expensesData) {
        const totalIncome = incomesData.incomes.reduce((sum, item) => sum + item.income_amount, 0);
        const totalExpenses = expensesData.expenses.reduce((sum, item) => sum + item.expense_amount, 0);
        const netBalance = totalIncome - totalExpenses;
        const totalTransactions = incomesData.incomes.length + expensesData.expenses.length;

        document.getElementById('total-income').textContent = formatCurrency(totalIncome);
        document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
        document.getElementById('net-balance').textContent = formatCurrency(netBalance);
        document.getElementById('total-transactions').textContent = totalTransactions;

        const balanceEl = document.getElementById('net-balance');
        if (netBalance < 0) {
            balanceEl.classList.remove('text-gray-800');
            balanceEl.classList.add('text-red-600');
        }
    }

    function renderMonthlyChart(incomesData, expensesData) {
        const ctx = document.getElementById('monthlyOverviewChart').getContext('2d');
        const data = { incomes: {}, expenses: {} };
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        incomesData.incomes.forEach(item => {
            const month = new Date(item.income_timestamp).getMonth();
            data.incomes[month] = (data.incomes[month] || 0) + item.income_amount;
        });

        expensesData.expenses.forEach(item => {
            const month = new Date(item.expense_timestamp).getMonth();
            data.expenses[month] = (data.expenses[month] || 0) + item.expense_amount;
        });

        const labels = [...new Set([...Object.keys(data.incomes), ...Object.keys(data.expenses)])]
            .map(Number)
            .sort((a, b) => a - b)
            .map(monthIndex => months[monthIndex]);

        const incomeData = labels.map(label => data.incomes[months.indexOf(label)] || 0);
        const expenseData = labels.map(label => data.expenses[months.indexOf(label)] || 0);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: 'rgba(34, 197, 94, 0.7)', 
                        borderColor: 'rgba(22, 163, 74, 1)',
                        borderWidth: 1,
                        borderRadius: 5,
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgba(220, 38, 38, 1)',
                        borderWidth: 1,
                        borderRadius: 5,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { position: 'top' },
                }
            }
        });
    }

    function renderExpenseDoughnutChart(incomesData, expensesData) {
        const ctx = document.getElementById('expenseDoughnutChart').getContext('2d');
        const expenseCategories = {};

        expensesData.expenses.forEach(expense => {
            expenseCategories[expense.category] = (expenseCategories[expense.category] || 0) + expense.expense_amount;
        });

        const labels = Object.keys(expenseCategories);
        const data = Object.values(expenseCategories);
        console.log("Expense data ===>", data)

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expenses by Category',
                    data: data,
                    backgroundColor: [
                        '#ef4444', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                        }
                    }
                }
            }
        });
    }

    function addRecentTransactions(incomesData, expensesData) {
        const tableBody = document.getElementById('transactions-table-body');
        const allTransactions = [
            ...incomesData.incomes.map(i => ({ ...i, type: 'Income', date: new Date(i.income_timestamp), amount: i.income_amount })),
            ...expensesData.expenses.map(e => ({ ...e, type: 'Expense', date: new Date(e.expense_timestamp), amount: e.expense_amount })),
        ];

        allTransactions.sort((a, b) => b.date - a.date);

        tableBody.innerHTML = ''; 

        const recentTransactions = allTransactions.slice(0, 7);

        console.log("RECENT TRANSACTIONS ===>", recentTransactions)
        recentTransactions.forEach(t => {
            const isIncome = t.type === 'Income';
            const row = `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="p-3 font-medium text-gray-700">${t.description}</td>
                    <td class="p-3 text-sm text-gray-500">${t.date.toLocaleDateString()}</td>
                    <td class="p-3 text-sm text-right font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}">
                        ${isIncome ? '+' : '-'} ${formatCurrency(t.amount)}
                    </td>
                    <td class="p-3 text-center">
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${t.type}
                        </span>
                    </td>
                    <td class="p-3 text-center">
                        <span class="px-2 py-1 text-xs font-medium rounded-full">
                            ${t.category}
                        </span>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }