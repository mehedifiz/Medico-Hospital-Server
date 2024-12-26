import validator from "validator";
import bcrypt from "bcrypt";
// import { v2 as cloudinary } from "cloudinary";
import { json } from "express";
import doctorModel from "../models/docorModel.js";
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appoinmentModel.js";
import userModel from "../models/userModel.js";
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


    console.log( email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      name,
      imageFile)

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
        console.log('succes login')
        res.json({success: true , token})



    } else{
        res.json({success:false , message: 'invalid credentials'})
    }



}  catch (err) {
    console.log(err)
    res.json({success: false , message: err.message})
  }
}
//api  to get all doclist in admin panal 

const allDoctors = async(req ,res )=>{

    try{
      const doctors = await doctorModel.find({}).select('-password')
      res.json({success: true , doctors})
      
    } catch (err) {
      console.log(err)
      res.json({success: false , message: err.message})
    }

}

//  load all appointments list 

const appointmentsAdmin= async(req , res)=>{
  try {
    
    const appointments = await appointmentModel.find({});

    res.json({success:true, appointments})

  }  catch (err) {
    console.log(err)
    res.json({success: false , message: err.message})
  }
}

//  cancell appoinment
const cencelAppoinments = async (req, res) => {
  try {
    const {  appointmentId } = req.body;
    console.log({ appointmentId });

    // Fetch appointment data
    const appointmentData = await appointmentModel.findById(appointmentId);

    

   

    // Update appointment to canceled
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // Release doctor's slot
    const { docId, slotDate, slotTime } = appointmentData;
    // console.log("docId, slotDate, slotTime", { docId, slotDate, slotTime });

    const doctorData = await doctorModel.findById(docId);

    if (!doctorData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    let slotsBooked = doctorData.slots_booked;

    if (slotsBooked[slotDate]) {
      slotsBooked[slotDate] = slotsBooked[slotDate].filter(
        (e) => e !== slotTime
      );
    }

    await doctorModel.findByIdAndUpdate(docId, { slots_booked: slotsBooked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get admin data
const adminDashboard = async(req , res)=>{

  try {
    console.log('dash')

    const doctors = await doctorModel.find({})
    const users = await userModel.find({}) 
    const appointments = await appointmentModel.find({});

    const dashData ={
      doctors: doctors.length,
      patients: users.length,
      appointments: appointments.length,
      latestAppointments: appointments.reverse().slice(0,5)
    }

    // console.log(dashData)
    res.json({success: true , dashData})
    
  }catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}



export { addDoctors  , loginAdmin , allDoctors , appointmentsAdmin , cencelAppoinments , adminDashboard }
