document.getElementById('income-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log('Submitting income form...');

    const token = localStorage.getItem('token');
    if (!token) return;

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const category = document.getElementById('income-category').value;

    try {
        const res = await fetch('/add-income', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'token': token
        },
        body: JSON.stringify({ description, amount, date, category })
        });

        if (res.ok) {
            alert('Income added successfully!');
            document.getElementById('income-form').reset();
        } else {
            const msg = await res.text();
            alert('Error: ' + msg);
        }
    } catch (err) {
        console.error('Error creating income:', err);
    }
});
