const form = document.getElementById('register-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.email.value;
  const name = form.name.value;
  const last_name = form.last_name.value;
  const password = form.password.value;

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ first_name: name, last_name: last_name, email, user_password: password })
    });

    const data = await res.json();
    console.log("Fetch register ==>", data);

    if (res.ok) {
      alert("User created successfully!")
      window.location.href = '/pages/login/index.html';
      localStorage.setItem('token', data.token);
    } else {
      alert('Error: ' + data.log);
    }
  } catch (err) {
    console.error('Error connecting with backend:', err);
    alert('Connection error');
  }
});
