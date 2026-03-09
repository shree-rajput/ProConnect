import { User } from "../models/users.model.js";
import bcrypt from "bcrypt";
import { Profile } from "../models/profile.model.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";import fs from 'fs';
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
     doc.fontSize(14).text(`Current Position : ${userData.currentPosition}`);
    
     doc.fontSize(14).text("Past work :")
     userData.pastWork.forEach((work , index) => {
        doc.fontSize(14).text(`Comapny name : ${work.companyName}`);
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
          const {token} = req.body;
          const user = await User.findOne({token : token});

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
          const userProfile = await Profile.findOne({userId : user_id }).populate("userId" , "name username email profilePicture" );
          let a = await convertProfileToPdf(userProfile);
          return res.json({message : a});
    }catch(e){
        return res.status(500).json({message : e.message});
    }
}