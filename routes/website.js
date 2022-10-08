const express =require("express");

const router = express.Router();

// middlewares
const { requireSignin, isAdmin } =require("../middlewares");
// controller
const { contact, createPage, getPage } =require("../controllers/website");

router.post("/contact", contact);
router.post("/page", requireSignin, isAdmin, createPage);
router.get("/page/:page", getPage);

module.exports= router;
