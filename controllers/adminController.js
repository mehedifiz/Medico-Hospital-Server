import validator from "validator";
import bcrypt from "bcrypt";
// import { v2 as cloudinary } from "cloudinary";
import { json } from "express";
import doctorModel from "../models/docorModel.js";
import jwt from 'jsonwebtoken'
//api for add doctrs

const addDoctors = async (req, res) => {
  try {
    const {
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      name,
      imageFile
    } = req.body;

    // const imageFile = req.file


    console.log( 'img' ,  imageFile )

    // checking for add data for doctors
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address ||
      !imageFile
    ) {
      return res.json({ success: false, message: "Missing details" });
    }

    // validating email
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // validate password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hasing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // //upload image to cloud
    // const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
    //   resource_type: "image",
    // });

    const imageUrl = imageFile ;

    const doctorData = {
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address : JSON.parse(address),
      image : imageUrl ,
      name,
      date: Date.now()
    };
    const newDoctor = new doctorModel(doctorData)

    await newDoctor.save()

    res.json({success: true , message: "doctor added"} )
  } catch (err) {
    console.log(err)
    res.json({success: false , message: err.message})
  }
};



// api for admin login 

const loginAdmin = async(req , res)=>{
try{

    const {email , password} = req.body;
    if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS){
        const token = jwt.sign(email+password , process.env.JWT_SECRET)
        res.json({success: true , token})



    } else{
        res.json({success:false , message: 'invalid credentials'})
    }



}  catch (err) {
    console.log(err)
    res.json({success: false , message: err.message})
  }
}

export { addDoctors  , loginAdmin};
