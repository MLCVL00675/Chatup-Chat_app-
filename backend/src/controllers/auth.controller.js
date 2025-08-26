import { generateJWT } from "../lib/utils.js";
import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "Enter all input fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be atleast 6 charecters" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpass = await bcrypt.hash(password, salt);

    const new_user = new User({
      email,
      fullname,
      password: hashedpass,
    });

    if (new_user) {
      generateJWT(new_user._id, res);
      await new_user.save();

      res.status(200).json({
        _id: new_user._id,
        email: new_user.email,
        fullname: new_user.fullname,
        profilepic: new_user.profilepic,
      });
    } else {
      return res.status(400).json({ message: "Invaid user data" });
    }
  } catch (e) {
    console.log("Error in sign up controller: ", e.message);
    return res.status(500).json({ message: "Internal Server Issue" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ispass = await bcrypt.compare(password, user.password);

    if (!ispass)
      return res.status(400).json({ message: "Invalid credentials" });
    generateJWT(user._id, res);

    res.status(200).json({
      _id: user._id,
      email: user.email,
      fullname: user.fullname,
      profilepic: user.profilepic,
    });
  } catch (e) {
    console.log("Error in login controller: ", e.message);
    return res.status(500).json({ message: "Internal Server Issue" });
  }
};
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (e) {
    console.log("Error in logout controller: ", e.message);
    return res.status(500).json({ message: "Internal Server Issue" });
  }
};

export const updateprofile = async (req, res) => {
  try {
    const { profilepic } = req.body;
    const userId = req.user._id;

    if (!profilepic) {
      res.status(400).json({ message: "Profile picture is required" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilepic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilepic: uploadResponse.secure_url },
      { new: true }
    );
    return res.status(200).json(updatedUser);
  } catch (e) {
    console.error("Error in update profile:", e.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (e) {
    console.log("Error in checkAuth controller: ", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
