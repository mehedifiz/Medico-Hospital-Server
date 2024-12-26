import doctorModel from "../models/docorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appoinmentModel.js";

const changeAvailablity = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });

    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

const doctorList = async (req, res) => {
  console.log("called");
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api for doc login

const docLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doc = await doctorModel.findOne({ email }); // find the doctor with the email

    if (!doc) {
      res.json({ success: false, message: "Invalid Credentials" });
    }

    const ismatch = await bcrypt.compare(password, doc.password);

    if (ismatch) {
      const token = jwt.sign({ id: doc._id }, process.env.JWT_SECRET);

      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
  }
};

// api to get doctor appointments

const getDocorAppoinments = async (req, res) => {
  try {
    const { docId } = req.body;

    const doctorappointments = await appointmentModel.find({ docId });

    console.log("doctorappointments", doctorappointments);
    res.json({ success: true, doctorappointments });
  } catch (error) {
    console.log;
  }
};
//  api co mard appoinments comp
const appoinmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    console.log({ docId, appointmentId });

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });

      return res.json({ success: true, message: "Appointments Completed" });
    } else {
      return res.json({ success: false, message: "Mark faild" });
    }
  } catch (error) {
    console.log(error);
  }
};

const AppointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    console.log({ docId, appointmentId });

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });

      return res.json({ success: true, message: "  Appointment called" });
    } else {
      return res.json({ success: false, message: "Mark faild" });
    }
  } catch (error) {
    console.log(error);
  }
};

//api to doc dash

const doctorDash = async (req, res) => {
  try {
    const { docId } = req.body;

    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;

    appointments.map((item) => {
      console.log(item);

      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    let patients = [];
    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestApp: appointments.reverse().slice(0, 5),
    };
    // console.log('dashData ' , dashData.earnings)
    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
  }
};

// api to get doc profile

const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;

    const profileData = await doctorModel.findById(docId).select("-password");
    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body;

    await doctorModel.findByIdAndUpdate(docId, { fees, address, available });

    res.json({ success: true, message: "Profile Update Successfully" });
  } catch (error) {
    console.log(error);
  }
};

export {
  changeAvailablity,
  doctorList,
  docLogin,
  getDocorAppoinments,
  doctorDash,
  appoinmentComplete,
  AppointmentCancel,
  doctorProfile,
  updateProfile,
};
