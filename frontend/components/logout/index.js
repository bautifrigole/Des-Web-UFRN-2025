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
