import jwt from "jsonwebtoken";

// user auth middleware

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    console.log('tokenDecode' , tokenDecode)

    req.body.userId = tokenDecode.id;
    console.log('  req.body.userId' ,   req.body.userId)

    next();
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

export default authUser;
