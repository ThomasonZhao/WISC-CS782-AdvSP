import React, { useState } from 'react';
import srp from 'secure-remote-password/client';
import { Link } from "react-router-dom";
import axios from "axios";

function Register({ serverAddr, setServerAddr }) {
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

        console.log("register user with username:", username, "and password:", password);

        try {
            const salt = srp.generateSalt()
            const privateKey = srp.derivePrivateKey(salt, username, password)
            const verifier = srp.deriveVerifier(privateKey)

            const response = await axios({
                url: `http://${serverAddr}/api/register`,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    username,
                    salt,
                    verifier
                }
            })
            const data = response.data;

            if (response.status !== 200) {
                console.error(data.message);
                alert(`An error occurred during registration: ${data.message}`)
                return;
            }

            alert(`User "${username}" registered successfully with password "${password}"!`)

        } catch (error) {
            console.error(error);
            alert(error.message)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Register (SRP)</h1>
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
                <Link to={`../login`}><button>GOTO LOGIN</button></Link >
            </div>
        </form>
    );
}

export default Register;