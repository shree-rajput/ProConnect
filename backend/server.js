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
app.use(express.urlencoded({ extended: true }));
//relative path 
app.use(express.static("uploads"));
app.use( postRoute);
app.use(userRoute);

const start = async () => {
  try {

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB connected");

    app.listen(5000, () => {
      console.log("Server running on PORT 5000");
    });

  } catch (err) {
    console.log("DB Error:", err);
  }
};

// start();
start();