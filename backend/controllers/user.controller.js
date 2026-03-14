import { User } from "../models/users.model.js";
import bcrypt from "bcrypt";
import { Profile } from "../models/profile.model.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";import fs from 'fs';
import { Connection } from "../models/connections.model.js";
// import { connection } from "mongoose";
// import { width } from "pdfkit/js/page";

const convertProfileToPdf = async(userData) =>{
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex")+ ".pdf";
  const stream = fs.createWriteStream("uploads/" + outputPath);
  doc.pipe(stream);

  doc.image(`uploads/${userData.userId.profilePicture}` , {align : "center" , width : 100})
  doc.fontSize(14).text(`Name : ${userData.userId.name}`);
   doc.fontSize(14).text(`Username : ${userData.userId.username}`);
    doc.fontSize(14).text(`Email : ${userData.userId.email}`);
     doc.fontSize(14).text(`Bio : ${userData.bio}`);
     doc.fontSize(14).text(`Current Position : ${userData.currentPost}`);
    
     doc.fontSize(14).text("Past work ")
     userData.pastWork.forEach((work , index) => {
        doc.fontSize(14).text(`Comapny name : ${work.company}`);
           doc.fontSize(14).text(`Position : ${work.position}`);
              doc.fontSize(14).text(`Years : ${work.years}`);
    })

    doc.end();
    return outputPath;
     };


export const register = async(req,res) => {
    console.log(req.body);
    try{
        const {email , name , username , password} = req.body;
        if(!name || !email || !username || !password) {
            return res.status(400).json({message : "All fields are required"});
        }
            const user = await User.findOne({
                email
            });
            if(user){
                 return res.status(400).json({message : "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password , 10);
        const newUser = new User({
            name, 
            email , 
            password : hashedPassword,
            username
        });
        await newUser.save();

        const profile = await new Profile({userId : newUser._id});
        await profile.save();
        return res.json({message : "user created successfully"})

    }catch(e){
        return res.status(500).json({message : e.message});
    }
}
export const login = async (req, res) => {
  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Username not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token });

    return res.status(200).json({
      message: "User logged in successfully",
      token
    });

  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export const uploadProfilePicture = async(req,res) => {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {token} = req.body;
    try{ 
        console.log("Token from request:", token);
        const user = await User.findOne({token : token});
        if(!user){
            return res.status(400).json({message : "user not found"});
        }
       if (!req.file) {
  return res.status(400).json({ message: "No file uploaded" });
}

user.profilePicture = req.file.filename;
        user.profilePicture = req.file.filename;
        
        await user.save();
        return res.status(200).json({message : "profile is updated"})

    }catch(e){
        return res.status(500).json({message : e.message});
    }
}

export const updateUserProfile = async(req,res) => {
  
    try{
        const {token , ...newUserData} = req.body;
        const user = await User.findOne({token :token });
        if(!user){
             return res.status(400).json({message : "user not found"});
        }

        const {username , email} = newUserData;
        const existingUser = await User.findOne({$or : [{username} , {email}]});
        if(existingUser){
            if(existingUser || String(existingUser._id) !== String(user._id)){
             return res.status(400).json({message : "user already exists"});
        }
    }

    Object.assign(user , newUserData);
    await user.save();

    return res.json({message : "user updated"})

    }catch(e){
         return res.status(500).json({message : e.message});
    }
} 


export const getUserAndProfile = async(req,res) => {
    try{
          const {token} = req.query;
          const user = await User.findOne({token : token});
         
          console.log(`Token : ${token}`);

          if(!user){
            return res.status(500).json({message : "user not found"});
          }

          const userProfile = await Profile.findOne({userId : user._id}).populate("userId" , 'name username email profilePicture');
          await userProfile.save();

          return res.json(userProfile);
    }catch(e){
        return res.status(500).json({message : e.message});
    }
}


export const updateProfileData = async (req,res) => {
    try{
      
       const {token , ...newProfileData} = req.body;
       const user = await User.findOne({token});
       if(!user){
        return res.status(400).json({message : "User not found"});
       }
       const profile = await Profile.findOne({userId : user._id});
       Object.assign(profile, newProfileData);

       await profile.save();
       return res.json({message : "User updated"});
    }catch(e){
        return res.status(500).json({message : e.message});
    }

}

export const getAllUserProfile = async(req,res) => {
    try{
        const profiles = await Profile.find({}).populate("userId" , "name username email profilePicture")
        return res.json({profiles});
    }catch(e){
        return res.status(500).json({message : e.message})
    }
}

export const downloadResume = async(req,res) => {

    try{
          const user_id = req.query.id;
          console.log("kuchh to aaya h yaha")
          console.log(user_id);
          const userProfile = await Profile.findOne({userId : user_id }).populate("userId" , "name username email profilePicture" );
          let a = await convertProfileToPdf(userProfile);
          return res.json({message : a});
    }catch(e){
        return res.status(500).json({message : e.message});
    }
}

export const sendRequestConnection = async(req,res) => {

    const {token , connectionID} = req.body;

    try{
        const user = await User.findOne({token});
        if(!user){
            return res.status(400).json({message : "user not found"}); 
        }

        const existingUser = await User.findOne({_id : connectionID});

        if(!existingUser){
            return res.status(400).json({message : "Connection user not found"}); 
        }
        
        let connection = await Connection.findOne({
            userId : user._id,
            connectionId : connectionID
        });

        if(connection){
            return res.json({message : "request already sent"});
        }

        let request = await new Connection({
              userId : user._id,
            connectionId : connectionID
        })

        await request.save();
        return res.json({message : "request sent !"})

    }catch(e){
        return res.status(500).json({message : e.message});
    }
}


export const getMyConnectionRequest = async(req,res) => {
    let {token} = req.body;
    try{
          
        const user = await User.findOne({token});
        if(!user){
            return res.status(400).json({message : "user not found"}); 
        }
       
        const connections = await Connection.find({userId : user._id}).populate("connectionId" , "name username email profilePicture");
        return res.json({connections});

    }catch(e){
     return res.status(500).json({message : e.message});
    }
}

export const whatAreMyConnection = async(req,res) => {
         const {token} = req.body;
    try{
              const user = await User.findOne({token});
              if(!user){
                return res.status(400).json({message : "User not found"});
              }

              const connections = await Connection.findOne({connectionId: user._id}).
              populate("userId" , "name username email profilePicture");
               
              return res.json({connections});
    }catch(e){
        return res.status(500).json({message : e.message});
    }
}

export const acceptConncetionRequest = async(req,res) => {
        const {token , requestId , action_type} = req.body;
    try{
          const user = await User.findOne({token});
          if(!user){
            return res.status(400).json({message : "User not found"});
          }
          const connection = await Connection.findOne({connectionId : requestId});
          if(!connection){
            return res.status(400).json({message : "connection not found"});
          }

          if(action_type === "accept"){
            connection.status_accepted = true;
          }else{
            connection.status_accepted = false;
          }
          await connection.save();
          return res.json({message : "request accepted"})

    }catch(e){
        return res.status(500).json({message : e.message});
    }
}