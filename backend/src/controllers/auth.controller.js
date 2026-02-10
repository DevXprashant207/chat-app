import User from '../models/User.js';
import bcrypt from "bcryptjs";
import { generateToken } from '../lib/utils.js';
import {ENV} from "../lib/env.js"
import cloudinary from  "../lib/cloudinary.js"

export const signup = async (req, res) =>{
    const { fullname, email, password } = req.body; //it will give undefined if we don't use express.json() middleware
    try{
        if(!fullname || !email || !password){
            return res.status(400).json({message:"All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters long"});
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message:"Invalid email format"});
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message:"User with this email already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const newUser = new User({
            fullname,
            email,
            password:hashedPassword
        });
        if(newUser){
            generateToken(newUser._id,res);
            await newUser.save();
            return res.status(201).json({
                _id:newUser._id,
                fullname:newUser.fullname,
                email:newUser.email,
                profilePic:newUser.profilePic,

            });
        
            try{
                await sendWelcomeEmail(newUser.email, newUser.fullname, ENV.CLIENT_URL);
            }catch(error){}
        }else{
            return  res.status(400).json({message:"Invalid user data"});
        }

    }catch(error){
        console.log("Error in signup controller:", error);
        return res.status(500).json({message:"Internal server error"});
    }
    

}
export const login = async (req, res) =>{
    const { email, password } = req.body;
    try{
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid email or password"});
        }
        generateToken(user._id,res);
        return res.status(200).json({
            _id:user._id,
            fullname:user.fullname,
            email:user.email,
            profilePic:user.profilePic,
        });
    }catch(error){
        console.log("Error in login controller:", error);
        return res.status(500).json({message:"Internal server error"});
    }
}
export const logout = (_ , res) =>{
    res.cookie("token","",{
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge:0
    });
    res.status(200).json({message:"Logged out successfully"});
}
export const updateProfile = async (req, res) => {
    try{
        const {profilePic} = req.body;
        if(!profilePic){
            return res.status(400).json({message:"Profile picture URL is required"});
        }
        const userId= req.user._id;
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser= await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url},{new:true});
        res.status(200).json({message:"Profile picture updated successfully", profilePic:uploadResponse.secure_url});
    }catch(error){
        console.error("Error in profile update:",error);
        res.status(500).json({message: "Internal server error"});
    }

}