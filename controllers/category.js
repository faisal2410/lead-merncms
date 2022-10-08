const Category =require("../models/category");
const Post =require("../models/post");
const slugify =require("slugify");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await new Category({
      name,
      slug: slugify(name),
    }).save();
    // console.log("saved category", category);
    res.json(category);
  } catch (error) {
    console.log(err);
  }
};

exports.categories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    console.log(err);
  }
};

exports.removeCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOneAndDelete({ slug });
    res.json(category);
  } catch (err) {
    console.log(err);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name } = req.body;
    const category = await Category.findOneAndUpdate(
      { slug },
      { name, slug: slugify(name) },
      { new: true }
    );
    res.json(category);
  } catch (err) {
    console.log(err);
  }
};

exports.postsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    const posts = await Post.find({ categories: category._id })
      .populate("featuredImage postedBy")
      .limit(20);

    res.json({ posts, category });
  } catch (err) {
    console.log(err);
  }
};
