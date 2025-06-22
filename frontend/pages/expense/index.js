document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) return;

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const category = document.getElementById('category-select').value;

    try {
        const res = await fetch('/add-expense', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'token': token
        },
        body: JSON.stringify({ description, amount, date, category })
        });

        if (res.ok) {
            alert('Expense added successfully!');
            document.getElementById('expense-form').reset();
        } else {
            const msg = await res.text();
            alert('Error: ' + msg);
        }
    } catch (err) {
        console.error('Error creating expense:', err);
    }
});
