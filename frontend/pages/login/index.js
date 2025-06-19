const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.email.value;
  const password = form.password.value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, user_password: password })
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = '/pages/home/index.html';
      localStorage.setItem('token', data.token);
    } else {
      alert('Error: ' + data.log);
    }
  } catch (err) {
    console.error('Error connecting with backend:', err);
    alert('Connection error');
  }
});
