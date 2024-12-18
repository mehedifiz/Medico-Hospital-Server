import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import doctorModel from "../models/docorModel.js";
import appointmentModel from "../models/appoinmentModel.js";

//  to to register user

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log({ name, email, password });

    if ((!name, !email, !password)) {
      return res.json({ success: false, message: "Missing Details" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Entar a valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Entar a strong password" });
    }

    //  hashing uer password

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    // _id
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api for user l

const loginUser = async (req, res) => {
  try {
    const { password, email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Imvalid credentuals" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//  api tp get user data

const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log("userId", userId);
    const userData = await userModel.findById(userId).select("-password");
    console.log(userData);

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// user to update user profle

const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender, image } = req.body;

    console.log({ name, phone, address, dob, gender, image }); // Debugging to confirm address structure

    if (!name || !phone || !address || !dob || !gender || !image) {
      return res.json({ success: false, message: "Data Missing" });
    }

    // Update the user document
    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address), // Directly use the address object
      dob,
      gender,
      image,
    });

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//  apit to book appointment

const bookAppointment = async (req, res) => {
  try {
    const { userId, slotDate, slotTime, docId } = req.body;
    console.log({ userId, slotDate, slotTime, docId })

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not abailable " });
    }

    let slots_booked = docData.slots_booked;
    console.log('slots_booked ' ,  slots_booked) //{}
    // checking for slots availablity

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slots not available" });

      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];

      console.log('slots_booked[slotDate] ' , slots_booked)

      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),

    };
    console.log('appoinments data' , appointmentData)

    const newAppoiment = new appointmentModel(appointmentData)
    await newAppoiment.save()

    // save new slot data in doctors data
    await doctorModel.findByIdAndUpdate(docId , {slots_booked})
    res.json({success:true , message:'Appointment Booked'})


  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { registerUser, loginUser, getProfile, updateProfile , bookAppointment };
