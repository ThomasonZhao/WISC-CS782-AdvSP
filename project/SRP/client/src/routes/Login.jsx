import React, { useState } from 'react';
import srp from 'secure-remote-password/client';
import { Link } from "react-router-dom";
import axios from "axios"

const server_address = "localhost:8081"

function Login({ serverAddr, setServerAddr }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {

            let salt = 0;
            let serverEphemeral = 0;

            const clientEphemeral = srp.generateEphemeral();

            // send clientEphemeral to server, get 'salt' and 'serverEphemeral.public', server store 'serverEphemeral.secret' for later use
            const response1 = await axios({
                url: `http://${serverAddr}/api/login/1`,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    username
                }
            })
            const data1 = response1.data;
            if (response1.status !== 200) {
                console.error(data1.message);
                alert(`An error occurred during login: ${data1.message}`)
                return;
            }

            salt = data1.value.salt;
            serverEphemeral = data1.value.serverEphemeral;

            const privateKey = srp.derivePrivateKey(salt, username, password)
            const clientSession = srp.deriveSession(clientEphemeral.secret, serverEphemeral, salt, username, privateKey)

            const response2 = await axios({
                url: `http://${serverAddr}/api/login/2`,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    username,
                    clientEphemeral: clientEphemeral.public,
                    clientSession: clientSession.proof
                }
            })
            const data2 = response2.data;
            if (response2.status !== 200) {
                console.error(data2.message);
                alert(`An error occurred during login: ${data2.message}`)
                return;
            }
            const serverSessionProof = data2.value.serverSession;

            srp.verifySession(clientEphemeral.public, clientSession, serverSessionProof)

            alert(`Login success: Username: ${username} Password: ${password}`);

        } catch (error) {
            console.error(error);
            alert(error.message)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Login (SRP)</h1>
            <label>
                Username:
                <input type="text" value={username} onChange={handleUsernameChange} />
            </label>
            <br />
            <label>
                Password:
                <input type="password" value={password} onChange={handlePasswordChange} />
            </label>
            <br />
            <div style={{ display: "flex", "justifyContent": "space-between" }}>
                <button type="submit">Submit</button>
                <Link to={`../register`}><button>GOTO REGISTER</button></Link >
            </div>
        </form>
    );
}

export default Login;