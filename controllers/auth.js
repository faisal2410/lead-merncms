const { signupService, findUserByEmail,findUserById,forgotPassword,resetPassword } = require("../services/auth");
const { generateToken } = require("../helpers/auth");
const User=require("../models/user");
// sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_KEY);


exports.register = async (req, res) => {
  try {
    const user = await signupService(req.body);

    const token = user.generateConfirmationToken();

    await user.save({ validateBeforeSave: false });
   
    res.status(200).json({
      status: "success",
      message: "Successfully signed up",
    });
  } catch (error) {   
    res.status(500).json({
      status: "fail",
      message:error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        status: "fail",
        error: "Please provide your credentials",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        status: "fail",
        error: "No user found. Please create an account",
      });
    }

    const isPasswordValid = user.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(403).json({
        status: "fail",
        error: "Password is not correct",
      });
    }

    if (user.status != "active") {
      return res.status(401).json({
        status: "fail",
        error: "Your account is not active yet.",
      });
    }

    const token =generateToken(user);

    // const { password: pwd, ...others } = user.toObject();
     // return user and token to client, exclude hashed password
     user.password = undefined;
     user.confirmPassword = undefined;
     // send token in cookie
     res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // only works on https
    });

     // send user as json response

    res.status(200).json({
      status: "success",
      message: "Successfully logged in",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};


exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      status:"success",
      message: "Signout success"
     });
  } catch (err) {
   res.status(400).json({
    status:"Fail",
    message:err.message
   })
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email)
    // console.log("CURRENT_USER", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(email);
    const shortCode = uid(6).toUpperCase();
    const user = await forgotPassword(email,shortCode)
    if (!user) return res.status(400).send("User not found");

    // prepare for email
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
                <html>
                  <h1>Reset password</h1>
                  <p>User this code to reset your password</p>
                  <h2 style="color:red;">${shortCode}</h2>
                  <i>leadmerncms.com</i>
                </html>
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Reset Password",
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    // console.table({ email, code, newPassword });
    // const hashedPassword = await hashPassword(newPassword);

    const user = await resetPassword(email,code,newPassword)
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error! Try again.");
  }
};


exports.createUser = async (req, res) => {
  try {
    const { firstName,lastName, email,password,confirmPassword, role, website } = req.body;
 // if user exist
 const exist = await User.findOne({ email });
 if (exist) {
   return res.json({ error: "Email is taken" });
 }
    const user = await new User({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role,
      website,
    }).save();
    return res.status(200).json(user);
  
  } catch (err) {
    res.status(400).json({
      status:"Fail",
      message:err.message
    })
  }
};