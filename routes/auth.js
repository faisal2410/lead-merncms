const express =require("express");

const router = express.Router();

// middleware
const {verifyToken} =require("../middlewares/auth");
const {isAdmin,isAuthor}=require("../middlewares/authorization");

// controllers
const {
  register,
  login,
  logout,
  currentUser,
  forgotPassword,
  resetPassword,
  createUser
} =require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/current-subscriber", verifyToken, currentUser);
router.get("/current-admin", verifyToken, isAdmin, currentUser);
router.get("/current-author", verifyToken, isAuthor, currentUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/create-user", verifyToken, isAdmin, createUser);
router.get("/",(req,res)=>{
  res.status(200).json({
    message:"<========== Welcome to lead Merncms ========>"
  })
})

module.exports = router;
