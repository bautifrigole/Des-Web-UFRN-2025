const token = localStorage.getItem('token');
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

async function renderTransactions() {
    const tableBody = document.getElementById('transactions-page-table-body');
    try {
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
            const allTransactions = [
                ...incomesData.incomes.map(i => ({ ...i, type: 'Income', date: new Date(i.income_timestamp), amount: i.income_amount })),
                ...expensesData.expenses.map(e => ({ ...e, type: 'Expense', date: new Date(e.expense_timestamp), amount: e.expense_amount })),
            ];

            allTransactions.sort((a, b) => b.date - a.date);
            tableBody.innerHTML = '';
            console.log("RECENT TRANSACTIONS ===>", allTransactions)
            allTransactions.forEach((t, index) => {
                const isIncome = t.type === 'Income';
                const transactionJson = encodeURIComponent(JSON.stringify(t));
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
                            <td class="p-3 text-center">
                                <button class="text-red-500 hover:text-red-700"  onclick="deleteTransaction('${transactionJson}')" title="Delete">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7L5 7M6 7L6 19a2 2 0 002 2h8a2 2 0 002-2L18 7M10 11v6M14 11v6M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    `;
                tableBody.innerHTML += row;
            });
        }
    } catch (error) {
        console.log("ERROR: ", error)
    }
}

async function deleteTransaction(transactionJson) {
    const transaction = JSON.parse(decodeURIComponent(transactionJson));
    console.log("TRANSACTION RECEIVED ===>", transaction);

    const headers = {
        'Content-Type': 'application/json',
        'token': token
    };

    if (transaction.type === "Expense") {
        const resExpenses = await fetch('/delete-expense', {
            method: 'DELETE',
            headers,
            body: JSON.stringify({
                expense_id: transaction.expense_id,
                category: transaction.category
            })
        });

        if (resExpenses.ok) {
            alert("Expense deleted!");
        } else {
            const errorText = await resExpenses.text();
            console.error("Delete expense failed:", errorText);
        }

    } else {
        const resIncomes = await fetch('/delete-income', {
            method: 'DELETE',
            headers,
            body: JSON.stringify({
                income_id: transaction.income_id
            })
        });

        if (resIncomes.ok) {
            alert("Income deleted!");
        } else {
            const errorText = await resIncomes.text();
            console.error("Delete income failed:", errorText);
        }
    }

    renderTransactions();
}


document.addEventListener('DOMContentLoaded', renderTransactions);
