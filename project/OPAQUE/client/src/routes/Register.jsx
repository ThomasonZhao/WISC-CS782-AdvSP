import React, { useState } from 'react';
import * as opaque from "@serenity-kit/opaque"
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

            const { clientRegistrationState, registrationRequest } =
                opaque.client.startRegistration({ password });


            const response1 = await axios({
                url: `http://${serverAddr}/api/register/1`,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    username,
                    registrationRequest
                }
            })
            const data1 = response1.data;
            if (response1.status !== 200) {
                console.error(data1.message);
                alert(`An error occurred during login: ${data1.message}`)
                return;
            }

            const registrationResponse = data1.value.registrationResponse;

            const { registrationRecord } = opaque.client.finishRegistration({
                clientRegistrationState,
                registrationResponse,
                password,
            });


            const response2 = await axios({
                url: `http://${serverAddr}/api/register/2`,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    username,
                    registrationRecord
                }
            })
            if (response2.status !== 200) {
                const data2 = response2.data;
                console.error(data2.message);
                alert(`An error occurred during login: ${data2.message}`)
                return;
            }

            alert(`User "${username}" registered successfully with password "${password}"!`)

        } catch (error) {
            console.error(error);
            alert(`An error occurred during login: ${error.message}`)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Register (OPAQUE)</h1>
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