import { findByLabelText } from "@testing-library/react";
import React from "react";
import { Link } from "react-router-dom";

function Home() {
    return (
        <>
            <h1>HELLO OPAQUE !!!</h1>
            <div style={{ display: "flex", "justifyContent": "space-between" }}>
                <Link to={`login`}><button>LOGIN</button></Link >
                <Link to={`register`}><button>REGISTER</button></Link>
            </div>
        </>
    );
}

export default Home;