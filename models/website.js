const mongoose =require("mongoose");
const { ObjectId } = mongoose.Schema;

const websiteSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      lowercase: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    fullWidthImage: { type: ObjectId, ref: "Media" },
  },
  { timestamps: true }
);

const Website= mongoose.model("Website", websiteSchema);
module.exports= Website;
