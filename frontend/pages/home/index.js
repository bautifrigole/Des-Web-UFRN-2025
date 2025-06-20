document.addEventListener('DOMContentLoaded', async () => {
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

        if (expensesData.expenses.length > 0 || incomesData.incomes.length > 0) {
          dashboardText.textContent = `You have ${expensesData.expenses.length} expenses and ${incomesData.incomes.length} incomes registered.`;
        } else {
          dashboardText.textContent = 'Unfortunately, you do not have any data registered yet.';
        }
      } else {
        dashboardText.textContent = 'Unfortunately, you do not have any data registered yet.';
      }
    } catch (err) {
      console.error('Error getting user information:', err);
    }
  });
 

const logoutBtn = document.getElementById('logout-tag');
logoutBtn.addEventListener('click', async e => {
  e.preventDefault();
  await logout();
  window.location.href = '/pages/initial/index.html';
});


async function logout() {
  const token = localStorage.getItem('token');
  const user_id = localStorage.getItem('user_id');
  const logout = await fetch('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': token,
    },
    body: JSON.stringify({ user_id: user_id})
  });

  if(logout.status === 200)
    alert("Logout successful");

}
