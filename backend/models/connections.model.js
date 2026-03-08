import mongoose from "mongoose";
import { User } from "./users.model";

const connectionSchema = mongoose.Schema({
     userId : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : "User"
     } , 
     connectionId : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : "User"
     },
     status_accepted : {
        type : Boolean , 
        default : null
     }
});

const Connection = mongoose.model("Connection" , connectionSchema);
export {Connection};