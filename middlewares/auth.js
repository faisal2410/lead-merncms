const User =require("../models/user");
const Post =require("../models/post");
const Media =require("../models/media");
const Comment =require("../models/comment");
const {expressjwt} =require("express-jwt");
require("dotenv").config();

// req.user = _id
exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});


exports.isAdmin = async (req, res, next) => {
  console.log(req.auth)
  try {
    const user = await User.findById(req.auth._id);
    if (user.role !== "admin") {
      return res.status(403).json({
        status:"Fail",
        message:"Unauthorized.Admin resource"
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

exports.isAuthor = async (req, res, next) => {
  console.log(req.auth)
  try {
    const user = await User.findById(req.auth._id);
    if (user.role !== "author") {
      return res.status(403).json({
        status:"Fail",
        message:"Unauthorized! Author resource"});
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

exports.canCreateRead = async (req, res, next) => {
  console.log(req.auth)
  try {
    const user = await User.findById(req.auth._id);
    switch (user.role) {
      case "admin":
        next();
        break;
      case "author":
        next();
        break;
      default:
        return res.status(403).json({
          status:"Fail",
          message:"Unauthorized"
        });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.canUpdateDeletePost = async (req, res, next) => {
  console.log(req.auth)
  try {
    const user = await User.findById(req.auth._id);
    const post = await Post.findById(req.params.postId);
    switch (user.role) {
      case "admin":
        next();
        break;
      case "author":
        if (post.postedBy.toString() !== user._id.toString()) {
          return res.status(403).json({
            status:"Fail",
            message:"Unauthorized"
          });
        } else {
          next();
        }
        break;
      default:
        return res.status(403).json({
          status:"Fail",
          message:"Unauthorized"
        });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.canDeleteMedia = async (req, res, next) => {
  console.log(req.auth)
  try {
    const user = await User.findById(req.auth._id);
    const media = await Media.findById(req.params.id);
    switch (user.role) {
      case "admin":
        next();
        break;
      case "author":
        if (media.postedBy.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            status:"Fail",
            message:"Unauthorized"
          });
        } else {
          next();
        }
        break;
    }
  } catch (err) {
    console.log(err);
  }
};

exports.canUpdateDeleteComment = async (req, res, next) => {
  console.log(req.auth)
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    const user = await User.findById(req.auth._id);

    switch (user.role) {
      case "admin":
        next();
        break;
      case "author":
        if (comment.postedBy.toString() === req.user._id.toString()) {
          next();
        }
        break;
      case "subscriber":
        if (comment.postedBy.toString() === req.user._id.toString()) {
          next();
        }
        break;
      default:
        return res.status(403).json({
          status:"Fail",
          message:"Unauthorized"
        });
    }
  } catch (err) {
    console.log(err);
  }
};
