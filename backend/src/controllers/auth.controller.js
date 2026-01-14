import User from '../models/User.js';
import bcrypt from "bcryptjs";
import { generateToken } from '../lib/utils.js';
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
        }

    }catch(error){
        console.log("Error in signup controller:", error);
        return res.status(500).json({message:"Internal server error"});
    }
    

}