import React, { useState } from 'react';
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

            // send clientEphemeral to server, get 'salt' and 'serverEphemeral.public', server store 'serverEphemeral.secret' for later use
            const response = await axios({
                url: `http://${serverAddr}/api/login/`,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    username,
                    password
                }
            })
            const data = response.data;
            if (response.status !== 200) {
                console.error(data.message);
                alert(`An error occurred during login: ${data.message}`)
                return;
            }

            alert(`Login success: Username: ${username} Password: ${password}`);

        } catch (error) {
            console.error(error);
            alert(error.message)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Login (PASSWORD)</h1>
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