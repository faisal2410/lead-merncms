const multer = require('multer');
const Post =require("../models/post");
const User =require("../models/user");
const Category =require("../models/category");
const Media =require("../models/media");
const Comment =require("../models/comment");
const slugify =require("slugify");


exports.uploadImage = async (req, res) => {
  try {
    const storage=multer.diskStorage({
      destination: (req,file,callBack)=> {
          callBack(null,'public/media');
      },
      filename: (req,file,callBack)=> {
          callBack(null,file.originalname)
      }    
      
  });
  const maxSize = 5 * 1024 * 1024; // for 5MB  
  const upload=multer({
    storage:storage,
    fileFilter: (req, file, cb)=> {
      if(file.mimetype==="image/jpg"||
        file.mimetype==="image/png"||
        file.mimetype==="image/jpeg"||
        file.mimetype==="image/webp"      
      ){
        cb(null, true)
      }else{
        cb(null, false);
        return cb(new Error("Only jpg, png, jpeg and webp format is allowed"))
      }
    },
    limits: { fileSize: maxSize }
  }).array('photos', 12)
  
   
    upload(req,res, (error)=> {  
      if (error instanceof multer.MulterError) {        
        res.status(400).json({
          status:"Fail",
          message:error.message
        })
      } else if (error) {      
        res.status(400).json({
          status:"Fail",
          message:error.message
        })
      }    
      else{
          res.status(200).json({
            status:"Success",
            message:"File upload Success"
          })
      }
});
  } catch (err) {
    res.status(400).json({
      status:"Fail",
      message:err.message
    })
  }
};
exports.uploadImageFile = async (req, res) => {
  try {
    const storage=multer.diskStorage({
      destination: (req,file,callBack)=> {
          callBack(null,'public/media');
      },
      filename: (req,file,callBack)=> {
          callBack(null,file.originalname)
      }    
      
  });
  const maxSize = 1 * 1024 * 1024; // for 1MB  
  const upload=multer({
    storage:storage,
    fileFilter: (req, file, cb)=> {
      if(file.mimetype==="image/jpg"||
        file.mimetype==="image/png"||
        file.mimetype==="image/jpeg"||
        file.mimetype==="image/webp"      
      ){
        cb(null, true)
      }else{
        cb(null, false);
        return cb(new Error("Only jpg, png, jpeg and webp format is allowed"))
      }
    },
    limits: { fileSize: maxSize }
  }).array('photos', 12)
  
   
    upload(req,res, async(error)=> {  
      console.log("file path test",req.files)
      if (error instanceof multer.MulterError) {        
        res.status(400).json({
          status:"Fail",
          message:error.message
        })
      } else if (error) {      
        res.status(400).json({
          status:"Fail",
          message:error.message
        })
      }    
      else{

//নোট: কিভাবে মাল্টিপল ফাইল পাথ ইউআরএল এর মধ্যে রাখা যায় ফর লুপ চালিয়ে সেটা দেখতে হবে, যাতে যেকোন সংখ্যক ইমেজ আপলোড করা যায় (লাইন নং 113)
        const media =await new Media({
              url: [req.files[0].path,req.files[1].path] ,            
              postedBy: req.auth._id,
            }).save();
          res.status(200).json({
            status:"Success",
            message:"File upload Success",
            media:media
          })
      }
});
  } catch (err) {
    res.status(400).json({
      status:"Fail",
      message:err.message
    })
  }
};
exports.createPost = async (req, res) => {
  try {
    // console.log(req.body);
    const { title, content, categories } = req.body;
    // check if title is taken
    const alreadyExist = await Post.findOne({
      slug: slugify(title.toLowerCase()),
    });
    if (alreadyExist) return res.json({ error: "Title is taken" });

    // get category ids based on category name
    let ids = [];
    for (let i = 0; i < categories.length; i++) {
      Category.findOne({
        name: categories[i],
      }).exec((err, data) => {
        if (err) return console.log(err);
        ids.push(data._id);
      });
    }

    // save post
    setTimeout(async () => {
      try {
        const post = await new Post({
          ...req.body,
          slug: slugify(title),
          categories: ids,
          postedBy: req.auth._id,
        }).save();

        // push the post _id to user's posts []
        await User.findByIdAndUpdate(req.auth._id, {
          $addToSet: { posts: post._id },
        });

        return res.json(post);
      } catch (err) {
        console.log(err);
      }
    }, 1000);
  } catch (err) {
    console.log(err);
  }
};

// export const posts = async (req, res) => {
//   try {
//     const all = await Post.find()
//       .populate("featuredImage")
//       .populate("postedBy", "name")
//       .populate("categories", "name slug")
//       .sort({ createdAt: -1 });
//     res.json(all);
//   } catch (err) {
//     console.log(err);
//   }
// };

exports.posts = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page || 1;

    const all = await Post.find()
      .skip((page - 1) * perPage)
      .populate("featuredImage")
      .populate("postedBy", "name")
      .populate("categories", "name slug")
      .sort({ createdAt: -1 })
      .limit(perPage);
    res.json(all);
  } catch (err) {
    console.log(err);
  }
};

// exports.uploadImageFile = async (req, res) => {
//   try {
//     // console.log(req.files);
//     const result = await cloudinary.uploader.upload(req.files.file.path);
//     // save to db
//     const media = await new Media({
//       url: result.secure_url,
//       public_id: result.public_id,
//       postedBy: req.user._id,
//     }).save();
//     res.json(media);
//   } catch (err) {
//     console.log(err);
//   }
// };

exports.media = async (req, res) => {
  try {
    const media = await Media.find()
      .populate("postedBy", "_id")
      .sort({ createdAt: -1 });
    res.json(media);
  } catch (err) {
    console.log(err);
  }
};

exports.removeMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

exports.singlePost = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug })
      .populate("postedBy", "name")
      .populate("categories", "name slug")
      .populate("featuredImage", "url");
    // comments
    const comments = await Comment.find({ postId: post._id })
      .populate("postedBy", "name")
      .sort({ createdAt: -1 });

    console.log("__comments__", comments);

    res.json({ post, comments });
  } catch (err) {
    console.log(err);
  }
};

exports.removePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

exports.editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, featuredImage, categories } = req.body;
    // get category ids based on category name
    let ids = [];
    for (let i = 0; i < categories.length; i++) {
      Category.findOne({
        name: categories[i],
      }).exec((err, data) => {
        if (err) return console.log(err);
        ids.push(data._id);
      });
    }

    setTimeout(async () => {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          title,
          slug: slugify(title),
          content,
          categories: ids,
          featuredImage,
        },
        { new: true }
      )
        .populate("postedBy", "name")
        .populate("categories", "name slug")
        .populate("featuredImage", "url");

      res.json(post);
    }, 1000);
  } catch (err) {
    console.log(err);
  }
};

exports.postsByAuthor = async (req, res) => {
  try {
    const posts = await Post.find({ postedBy: req.auth._id })
      .populate("postedBy", "name")
      .populate("categories", "name slug")
      .populate("featuredImage", "url")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err);
  }
};

exports.postCount = async (req, res) => {
  try {
    const count = await Post.countDocuments();
    res.json(count);
  } catch (err) {
    console.log(err);
  }
};

exports.postsForAdmin = async (req, res) => {
  try {
    const posts = await Post.find().select("title slug");
    res.json(posts);
  } catch (err) {
    console.log(err);
  }
};

exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    let newComment = await new Comment({
      content: comment,
      postedBy: req.auth._id,
      postId,
    }).save();
    newComment = await newComment.populate("postedBy", "name");
    res.json(newComment);
  } catch (err) {
    console.log(err);
  }
};

exports.comments = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page || 1;

    const allComments = await Comment.find()
      .skip((page - 1) * perPage)
      .populate("postedBy", "name")
      .populate("postId", "title slug")
      .sort({ createdAt: -1 })
      .limit(perPage);

    return res.json(allComments);
  } catch (err) {
    console.log(err);
  }
};

exports.userComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postedBy: req.auth._id })
      .populate("postedBy", "name")
      .populate("postId", "title slug")
      .sort({ createdAt: -1 });

    return res.json(comments);
  } catch (err) {
    console.log(err);
  }
};

exports.commentCount = async (req, res) => {
  try {
    const count = await Comment.countDocuments();
    res.json(count);
  } catch (err) {
    console.log(err);
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );
    res.json(updatedComment);
  } catch (err) {
    console.log(err);
  }
};

exports.removeComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

exports.getNumbers = async (req, res) => {
  try {
    const posts = await Post.countDocuments();
    const users = await User.countDocuments();
    const comments = await Comment.countDocuments();
    const categories = await Category.countDocuments();

    return res.json({ posts, users, comments, categories });
  } catch (err) {
    console.log(err);
  }
};
