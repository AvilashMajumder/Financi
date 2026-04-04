import dotenv from 'dotenv';
import connectDB from './db/index.js';
import {app} from './app.js';
import path from 'path';
import {fileURLToPath} from 'url';

dotenv.config(
    {
        path: './.env'
    }
)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error: ", error);
        throw error;
    })
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed, server not started ", err);
    process.exit(1);
})