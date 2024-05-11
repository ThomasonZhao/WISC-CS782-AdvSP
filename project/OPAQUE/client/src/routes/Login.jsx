import React, { useState } from 'react';
import * as opaque from "@serenity-kit/opaque"
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

            const { clientLoginState, startLoginRequest } = opaque.client.startLogin({
                password,
            });

            const response1 = await axios({
                url: `http://${serverAddr}/api/login/1`,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    username,
                    startLoginRequest
                }
            });
            const data1 = response1.data;
            if (response1.status !== 200) {
                console.error(data1.message);
                alert(`An error occurred during login: ${data1.message}`)
                return;
            }

            const loginResponse = data1.value.loginResponse;

            const loginResult = opaque.client.finishLogin({
                clientLoginState,
                loginResponse,
                password,
            });
            if (!loginResult) {
                alert("login failed");
                return;
            }
            const { finishLoginRequest, sessionKey } = loginResult;
            // to this point, extracting session key is enough to call a success. For experiment purpose, we compare to the one generated by server

            const response2 = await axios({
                url: `http://${serverAddr}/api/login/2`,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    username,
                    finishLoginRequest
                }
            });
            const data2 = response2.data;
            if (response2.status !== 200) {
                console.error(data2.message);
                alert(`An error occurred during login: ${data2.message}`)
                return;
            }
            
            data2.value.sessionKey === sessionKey ? alert(`Login success: Username: ${username} Password: ${password}`) : alert("Login failed");


        } catch (error) {
            console.error(error);
            alert(error.message)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Login (OPAQUE)</h1>
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