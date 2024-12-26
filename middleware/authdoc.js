import jwt from "jsonwebtoken";

// doctor auth middleware

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    // console.log("dtoken " ,dtoken)
    if (!dtoken) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    const tokenDecode = jwt.verify(dtoken, process.env.JWT_SECRET);
    // console.log('tokenDecode' , tokenDecode)

    req.body.docId = tokenDecode.id;
    console.log('  req.body.userId' ,   req.body.docId)

    next();
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

export default authDoctor;
