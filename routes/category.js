const express =require("express");
const router = express.Router();

// middleware
const { requireSignin, isAdmin } =require("../middlewares");
// controllers
const {
  create,
  categories,
  removeCategory,
  updateCategory,
  postsByCategory,
} =require("../controllers/category");

router.post("/category", requireSignin, isAdmin, create);
router.get("/categories", categories);
router.delete("/category/:slug", requireSignin, isAdmin, removeCategory);
router.put("/category/:slug", requireSignin, isAdmin, updateCategory);
router.get("/posts-by-category/:slug", postsByCategory);

module.exports= router;
