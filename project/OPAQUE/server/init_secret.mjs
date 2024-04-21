import mongoose from 'mongoose';
import * as opaque from "@serenity-kit/opaque";

const mongodb_path = "127.0.0.1:8084/OPAQUE";

mongoose.connect(`mongodb://${mongodb_path}`, {}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let serverSetup = "";
const setupSchema = new mongoose.Schema({
    serverSetup: { type: String, required: true, unique: true },
    type: { type: String, required: true }
})
const Setup = db.model("setup", setupSchema);

const qry = await Setup.find({ type: "serverSetup" })
if (qry.length !== 0) {
    console.error("Don't try to repeat the setup");
    console.error(qry.length);
    exit;
}
