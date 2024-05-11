import express from 'express';
import mongoose from 'mongoose';
import * as opaque from "@serenity-kit/opaque";
import { sha1 } from "js-sha1"
import cors from 'cors';

// path variables //
const port = 8083;
const mongodb_path = "127.0.0.1:8084/OPAQUE";


const app = express();

mongoose.connect(`mongodb://${mongodb_path}`, {}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define User schema
const userSchema = new mongoose.Schema({
    userIdentifier: { type: String, required: true, unique: true },
    registrationRecord: { type: String, required: true },
    serverLoginState: { type: String }
});
const User = db.model('User', userSchema);

// get server setup
let serverSetup = "";
const setupSchema = new mongoose.Schema({
    serverSetup: { type: String, required: true, unique: true },
    type: { type: String, required: true }
})
const Setup = db.model("setup", setupSchema);

// wait for setup seed
const qry = await Setup.find({});
if (qry.length === 0) {
    console.log("try to setup server secret");
    await opaque.ready;
    serverSetup = opaque.server.createSetup();
    const newSetup = new Setup({ serverSetup: serverSetup, type: "serverSetup" });
    await newSetup.save();
}
else if (qry.length !== 1) {
    console.error('Error getting server setup');
    console.error(qry.length);
} else {
    serverSetup = qry[0].serverSetup;
}

// wait until opaque set up
await opaque.ready;

// Middleware to parse JSON request body
app.use(express.json());
app.use(cors())

// Register route
app.post('/api/register/1', async (req, res) => {
    const { username, registrationRequest } = req.body;

    // console.log(`Received registration request for username: ${username} (part 1)`);

    try {
        // check repeated username
        const userIdentifier = sha1(username)
        const qry = await User.find({ userIdentifier: userIdentifier });
        if (qry.length !== 0) {
            console.error(`Error registering user: invalid length of qry ${qry.length}`);
            res.status(500).json({
                success: false,
                message: `An error occurred: invalid qry len ${qry.length}`
            });
            return;
        }

        const { registrationResponse } = opaque.server.createRegistrationResponse({
            serverSetup,
            userIdentifier,
            registrationRequest
        });

        res.status(200).json({
            success: true,
            message: `User ${username} response generated!`,
            value: {
                registrationResponse
            }
        });

    } catch (error) {
        console.error('Error registering user:', error);

        res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
});

app.post('/api/register/2', async (req, res) => {

    const { username, registrationRecord } = req.body;
    // console.log(`Received registration request for username: ${username} (part 2)`);

    try {
        const userIdentifier = sha1(username);

        const newUser = new User({ userIdentifier, registrationRecord, serverLoginState: "" });
        await newUser.save();
        // console.log(`User ${username} registered`)

        res.status(200).json({
            success: true,
            message: `User ${username} registered`,
        });

    } catch (error) {
        console.error('Error registering user:', error);

        res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
})

app.post('/api/login/1', async (req, res) => {
    const { username, startLoginRequest } = req.body;

    // console.log(`Received login request for username: ${username} (part 1)`);

    try {
        const userIdentifier = sha1(username);

        const qry = await User.find({ userIdentifier: userIdentifier }, { registrationRecord: 1 });
        if (qry.length !== 1) {
            console.error(`Error registering user: invalid length of qry ${qry.length}`);
            res.status(500).json({
                success: false,
                message: `An error occurred: invalid qry len ${qry.length}`
            });
            return;
        }

        const { registrationRecord } = qry[0];

        const { serverLoginState, loginResponse } = opaque.server.startLogin({
            serverSetup,
            userIdentifier,
            registrationRecord,
            startLoginRequest,
        });

        await User.updateOne({ userIdentifier: userIdentifier }, { $set: { serverLoginState: serverLoginState } })

        res.status(200).json({
            success: true,
            message: `response generated`,
            value: {
                loginResponse
            }
        });

    } catch (error) {
        console.error('Error logging in:', error);

        res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }

});

app.post('/api/login/2', async (req, res) => {

    const { username, finishLoginRequest } = req.body;

    // console.log(`Received login request for username: ${username} (part 2)`);

    try {

        const userIdentifier = sha1(username);
        const qry = await User.find({ userIdentifier: userIdentifier }, { serverLoginState: 1 });
        if (qry.length !== 1) {
            console.error(`Error registering user: invalid length of qry ${qry.length}`);
            res.status(500).json({
                success: false,
                message: `An error occurred: invalid qry len ${qry.length}`
            });
            return;
        }

        const { serverLoginState } = qry[0];

        const { sessionKey } = opaque.server.finishLogin({
            finishLoginRequest,
            serverLoginState,
        });


        res.status(200).json({
            success: true,
            message: `sessionKey extracted`,
            value: {
                sessionKey: sessionKey
            }
        });

    } catch (error) {
        console.error('Error logging in:', error);

        res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
