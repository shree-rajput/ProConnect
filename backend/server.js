import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoute from './routes/posts.route.js';
import userRoute from './routes/users.route.js';

dotenv.config();
const app = express();


app.use(cors());
app.use(express.json());
//relative path 
app.use(express.static("uploads"));
app.use( postRoute);
app.use(userRoute);

const start = async() => {
    const connectDB = await mongoose.connect(process.env.MONGO_URL);
    app.listen(5000 , () => {
        console.log("server is connected with PORT :" , 5000);
    })
}
start();