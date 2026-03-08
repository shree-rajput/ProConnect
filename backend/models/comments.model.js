import mongoose, { mongo } from "mongoose";
import { User } from "./users.model.js";
import { Post } from "./posts.model.js"; 

const CommentSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }, 
    postId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Post"
    } , 
    body : {
       type : String,
       reuired : true
    }
});

const Comment = mongoose.model("Comment" , CommentSchema);
export {Comment};