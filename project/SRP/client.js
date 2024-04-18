const express = require('express');
const srp = require('secure-remote-password/client');

const app = express();
const port = 8080;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Register route
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// Register POST route handler
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    console.log(`Received registration request for username: ${username}`);

    try {
        const salt = srp.generateSalt()
        const privateKey = srp.derivePrivateKey(salt, username, password)
        const verifier = srp.deriveVerifier(privateKey)

        const response = await fetch('http://localhost:8081/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                salt,
                verifier
            })
        });
        const data = await response.json();

        if (response.status !== 200) {
            console.error(data.message);
            res.status(500).json({
                success: false,
                message: `An error occurred during registration: ${data.message}`
            });
            return;
        }
        
        res.status(200).json({
            success: true,
            message: `User "${username}" registered successfully with password "${password}"!`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: `An error occurred during registration: ${error.message}`
        });
    }
});

// Login route
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log(`Received login request for username: ${username}`);

    try {

        let salt = 0;
        let serverEphemeral = 0;

        const clientEphemeral = srp.generateEphemeral();

        // send clientEphemeral to server, get 'salt' and 'serverEphemeral.public', server store 'serverEphemeral.secret' for later use
        const response1 = await fetch('http://localhost:8081/login/1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username
            })
        });
        const data1 = await response1.json();
        if (response1.status !== 200) {
            console.error(data1.message);
            res.status(500).json({
                success: false,
                message: `An error occurred during login: ${data1.message}`
            });
            return;
        }
        salt = data1.value.salt;
        serverEphemeral = data1.value.serverEphemeral;

        const privateKey = srp.derivePrivateKey(salt, username, password)
        const clientSession = srp.deriveSession(clientEphemeral.secret, serverEphemeral, salt, username, privateKey)

        // send clientEphemeral.public, clientSession.proof to server, server send serverSession.proof back
        const response2 = await fetch('http://localhost:8081/login/2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                clientEphemeral: clientEphemeral.public,
                clientSession: clientSession.proof
            })
        });
        const data2 = await response2.json();
        if (response2.status !== 200) {
            console.error(data2.message);
            res.status(500).json({
                success: false,
                message: `An error occurred during login: ${data2.message}`
            });
            return;
        }
        const serverSessionProof = data2.value.serverSession;

        srp.verifySession(clientEphemeral.public, clientSession, serverSessionProof)

        res.status(200).json({
            success: true,
            message: `User ${username} logged in successfully!`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: `An error occurred during login: ${error.message}`
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
