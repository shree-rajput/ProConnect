import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoute from './routes/posts.route.js';

dotenv.config();
const app = express();


app.use(cors());
app.use(postRoute);
app.use(express.json());

const start = async() => {
    const connectDB = await mongoose.connect(process.env.MONGO_URL);
    app.listen(5000 , () => {
        console.log("server is connected with PORT :" , 5000);
    })
}
start();
