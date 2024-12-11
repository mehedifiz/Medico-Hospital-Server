import jwt from "jsonwebtoken";

// admin auth middleware

const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    const tokenDecode = jwt.verify(atoken, process.env.JWT_SECRET);

    if (tokenDecode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASS) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

export default authAdmin;
