const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema(
  {
    coachName: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["motivation", "technique", "mindset", "recovery"],
      default: "motivation",
    },
  },
  { timestamps: true }
);

feedSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Feed", feedSchema);
