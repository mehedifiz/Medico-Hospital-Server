import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import doctorModel from "../models/docorModel.js";
import appointmentModel from "../models/appoinmentModel.js";
import stripe from "stripe";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
// console.log(process.env.STRIPE_SECRET_KEY)

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
    // console.log(userData);

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

    // console.log({ name, phone, address, dob, gender, image }); // Debugging to confirm address structure

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

    const docData = await doctorModel.findById(docId).select("-password");
    console.log("docData", docData);

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not abailable " });
    }

    let slots_booked = docData.slots_booked;
    console.log("slots_booked ", slots_booked); //{}
    // checking for slots availablity

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slots not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];

      console.log("slots_booked[slotDate] ", slots_booked);

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
    console.log("appoinments data", appointmentData);

    const newAppoiment = new appointmentModel(appointmentData);
    await newAppoiment.save();

    // save new slot data in doctors data
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to user appoinments

const listAppointments = async (req, res) => {
  try {
    const { userId } = req.body;
    const appoinments = await appointmentModel.find( {userId} );
    console.log('thisis ueif ', userId , appoinments)

    res.json({ success: true, appoinments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to user cencel appoinments

const cencelAppoinments = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    // console.log({ userId, appointmentId });

    // Fetch appointment data
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Verify appointment user
    if (appointmentData.userId.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

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
const getDoc = async (req, res) => {
  try {
    const { docId } = req.query; // Extract docId from query parameters
    console.log("Received docId:", docId);

    if (!docId) {
      return res.status(400).json({ success: false, message: "docId is required" });
    }

    const doctor = await doctorModel.findById(docId); // Find the doctor by ID
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    console.log("Fetched doctor:", doctor);
    res.json({ success: true, doctor });
  } catch (error) {
    console.error("Error in getDoc:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// api to make paymet
const paymentStripe = async (req, res) => {
  try {
    const { price } = req.body;

    const amount = parseInt(price * 100);

    console.log("Amount:", amount);

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.json({ success: false, message: error.message });
  }
};




const verifyStripe = async (req, res) => {
  try {
    const { appoinmentId, success } = req.body;
    console.log( { appoinmentId, success } )
    const appointmentId = appoinmentId;

    if (success === "succeeded") {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        payment: true,
      });
      console.log('update payment status ')
      return res.json({ success: true, message: "Payment Successful" });
    }

    res.json({ success: false, message: "Payment Failed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cencelAppoinments,
  paymentStripe,
  verifyStripe,
  getDoc,
};
