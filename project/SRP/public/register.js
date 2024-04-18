document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const message = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;


        await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        }).then(response => {
            response.json().then(data => {
                // message.innerHTML = `<p>${data.message}</p>`;
                alert(`${data.message}`);
            });
        });
    });
});
