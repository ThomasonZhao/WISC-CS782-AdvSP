document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const message = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Here you can add your login logic
        // For demonstration, just show success message

        await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        }).then(response => {
            if (response.status === 200) {
                // message.innerHTML = '<p>Login successful!</p>';
                alert('Login successful!')
            } else {
                response.json().then(data => {
                    // message.innerHTML = `<p>${data.message}</p>`;
                    alert(`${data.message}`);
                });
            }
        });

        // if (username === 'admin' && password === 'password') {
        //     message.innerHTML = '<p>Login successful!</p>';
        // } else {
        //     message.innerHTML = '<p>Login failed. Please try again.</p>';

    });
});
