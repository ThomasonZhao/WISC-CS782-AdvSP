import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import cors from "cors";

// path variables //
const port = 8086;
const mongodb_path = "127.0.0.1:8084/BASIC";

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
    pwdHash: { type: String, required: true },
});
const User = db.model('User', userSchema);


// Register route
app.post('/api/register', async (req, res) => {
    const startTime = performance.now();

    const { username, password } = req.body;

    // console.log(`Received registration request for username: ${username}`);


    try {
        const salt = crypto.randomBytes(32).toString("hex");

        const saltedPwd = saltPwd(password, salt);

        const pwdHash = crypto.createHash("sha256").update(saltedPwd).digest().toString('hex');


        const newUser = new User({ username, salt, pwdHash });
        await newUser.save();

        // console.log(`salted password is ${saltedPwd}, pwdHash is ${pwdHash}`);


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

    const endTime = performance.now();
    console.log(JSON.stringify({ type: "register", protocol: "BASIC", time: (endTime - startTime) / 1000 }));
});

app.post('/api/login', async (req, res) => {
    const startTime = performance.now();

    const { username, password } = req.body;

    // console.log(`Received login request for username: ${username} (part 1)`);

    try {

        const qry = await User.find({ username: username });
        if (qry.length !== 1) {
            console.error(`Error logging in: user ${username} not found`);
            res.status(500).json({
                success: false,
                message: `An error occurred: user ${username} not found`
            });
            return;
        }
        const { salt, pwdHash } = qry[0];

        const saltedPwd = saltPwd(password, salt);
        const pwdHashAttempt = crypto.createHash("sha256").update(saltedPwd).digest().toString('hex');

        if (pwdHash !== pwdHashAttempt) {
            console.error(`Error logging in: invalid password for user ${username}`);
            res.status(500).json({
                success: false,
                message: `An error occurred: invalid password for user ${username}`
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: `User ${username} login successfully!`
        });


    } catch (error) {
        console.error('Error logging in:', error);

        res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }

    const endTime = performance.now();
    console.log(JSON.stringify({ type: "login", protocol: "BASIC", time: (endTime - startTime) / 1000 }));
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

/**
 * 
 * @param {String} pwd string
 * @param {String} salt hex string
 */
function saltPwd(pwd, salt) {

    const pwdPad = pwd.padEnd(32, "0");

    // convert pwdPad to bitstring
    const pwdBitBuffer = Buffer.from(pwdPad, 'utf8');

    // convert salt, a hex string, to bit string
    const saltBitBuffer = Buffer.from(salt, 'hex');

    // perform bitwise and operation on the two strings
    let result = "";
    for (let i = 0; i < pwdBitBuffer.length; i++) {
        result += pwdBitBuffer[i] & saltBitBuffer[i];
    }

    return result;
}