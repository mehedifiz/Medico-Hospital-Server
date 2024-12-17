import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import jwt from "jsonwebtoken"

//  to to register user 

const registerUser = async(req , res)=>{
    try {
        const {name ,email ,password} = req.body ;

        console.log({name ,email ,password} )


        if(!name ,!email ,!password){
                return res.json({success : false , message :"Missing Details"})
        }
        if (!validator.isEmail(email)) {
            return res.json({success : false , message :"Entar a valid email"})
            
        }
        if (password.length <8) {
            return res.json({success : false , message :"Entar a strong password"})
            
        }

        //  hashing uer password

        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password , salt)

        const userData = {
            name , 
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        // _id 
        const token = jwt.sign({id: user._id } , process.env.JWT_SECRET )
            res.json({success: true, token } )
        
    }catch (error) {
        console.log(error)
        res.json({success: false , message: error.message})
        
    }
}

// api for user l

const loginUser = async(req ,res)=>{
    try {

        const {password , email } = req.body;
        const user = await userModel.findOne({email})

        if (!user) {
         return   res.json({success: false , message: 'User does not exist'})
            
        }

        const isMatch = await bcrypt.compare(password , user.password)
        if(isMatch){
            const token = jwt.sign({id:user._id} ,process.env.JWT_SECRET)
            res.json({success:true ,token})
        } else{
            res.json({success: false , message:"Imvalid credentuals"})

        }
         
    } catch (error) {
        console.log(error)
        res.json({success: false , message: error.message})
        
    }
}

//  api tp get user data 

const getProfile =async(req , res)=>{
    try {

        const {userId}=req.body;

        console.log('userId' , userId)
        const userData = await userModel.findById(userId).select('-password')
        console.log(userData)

        res.json({success:true , userData})
        
    } catch (error) {
        console.log(error)
        res.json({success: false , message: error.message})
        
    }
}



export {registerUser ,loginUser , getProfile}