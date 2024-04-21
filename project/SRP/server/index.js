// path variables //
const port = 8081;
const mongodb_path = "127.0.0.1:8084/SRP";


const express = require('express');
const srp = require('secure-remote-password/server');
const mongoose = require('mongoose');
const cors = require('cors')

// Middleware to parse JSON request body
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(`mongodb://${mongodb_path}`, {}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    salt: { type: String, required: true },
    verifier: { type: String, required: true },
    serverEphemeralSecret: { type: String }
});
const User = db.model('User', userSchema);


// Register route
app.post('/api/register', async (req, res) => {
    const { username, salt, verifier } = req.body;

    console.log(`Received registration request for username: ${username}`);


    try {
        // check repeated username
        const qry = await User.find({ username: username });
        if (qry.length !== 0) {
            console.error(`Error registering user: invalid length of qry ${qry.length}`);
            res.status(500).json({
                success: false,
                message: `An error occurred: invalid qry len ${qry.length}`
            });
            return;
        }

        // Create a new user
        const newUser = new User({ username, salt, verifier, serverEphemeralSecret: "" });

        // Save the user to the database
        await newUser.save();

        res.status(200).json({
            success: true,
            message: `User ${username} registered successfully!`
        });

    } catch (error) {
        console.error('Error registering user:', error);

        res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
});

app.post('/api/login/1', async (req, res) => {
    const { username } = req.body;

    console.log(`Received login request for username: ${username} (part 1)`);

    try {

        // get verifier from db, set as global b4 db setup
        const qry = await User.find({ username: username }, { salt: 1, verifier: 1 });
        if (qry.length !== 1) {
            console.error('Error logging in: multiple or no entry found');
            res.status(500).json({
                success: false,
                message: `An error occurred: multiple or no entry found`
            });
            return;
        }


        const { salt, verifier } = qry[0];

        const serverEphemeral = srp.generateEphemeral(verifier);

        // send serverEphemeral.public to client, get 'clientSessionProof', server calculate 'serverSessionProof'
        await User.updateOne({ username: username }, { serverEphemeralSecret: serverEphemeral.secret });
        res.status(200).json({
            success: true,
            message: `serverEphemeral get`,
            value: {
                salt: salt,
                serverEphemeral: serverEphemeral.public
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

    const { username, clientEphemeral, clientSession } = req.body;

    console.log(`Received login request for username: ${username} (part 2)`);

    try {
        const qry = await User.find({ username: username }, { salt: 1, verifier: 1, serverEphemeralSecret: 1 });
        if (qry.length !== 1) {
            console.error('Error logging in: multiple or no entry found');
            res.status(500).json({
                success: false,
                message: `An error occurred: multiple or no entry found`
            });
            return;
        }

        const { salt, verifier, serverEphemeralSecret } = qry[0];
        const serverSession = srp.deriveSession(serverEphemeralSecret, clientEphemeral, salt, username, verifier, clientSession);

        res.status(200).json({
            success: true,
            message: `serverSession get`,
            value: {
                serverSession: serverSession.proof
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
