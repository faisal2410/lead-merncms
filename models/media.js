const mongoose =require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema;

const mediaSchema = new Schema(
  {
    url: [String],
    postedBy: { type: ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Media= mongoose.model("Media", mediaSchema);
module.exports=Media;
