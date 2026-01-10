import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["viewer", "editor", "admin"],
    default: "viewer"
  },
  tenantId: String
});

export default mongoose.model("User", userSchema);
