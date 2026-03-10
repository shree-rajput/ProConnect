import { User } from "../models/users.model.js";
import { Post } from "../models/posts.model.js";

export const activeCheck = async (req,res) => {
         return res.status(200).json({message : "RUNNING"});
}

export const createPost = async(req,res) => {
    const {token} = req.body;
    try{
        const user = await User.findOne({token});
        if(!user){
            return res.status(400).json({message : "user not found"});
        }
        const post = await new Post({
            userId : user._id,
            body : req.body.body,
            media : req.file !== undefined ? req.file.filename : "",
            fileType : req.file !== undefined ? req.file.mimetype.split("/")[1]: ""
        });

        await post.save();

        return res.status(200).json({message : "post created successfully"})
  
    }catch(e){
        return res.status(500).json({message : e.message});
    }
}


export const getAllPosts = async(req,res) => {
    try{
      const posts = await Post.find({}).populate("userId" , "name username email profilePicture")
      return res.json({posts});
    }catch(e){
        return res.status(500).json({message : e.message});
    }
}