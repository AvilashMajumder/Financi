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

