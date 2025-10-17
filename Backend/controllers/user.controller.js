import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import User from "../models/user.model.js";
import Meeting from "../models/meeting.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"; 

const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied." });
    }
    const token = authHeader.split(" ")[1];

    const user = await User.findOne({ token: token }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found for this token." });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Username or Password missing" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User doesn't exist Please sign up" });
    }
    let isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      let token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();
      return res.status(httpStatus.OK).json({
        token: token,
        user: { id: user._id, name: user.name, username: user.username },
      });
    } else {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Incorrect password or username" });
    }
  } catch (e) {
    return res.status(500).json({ message: `Something went wrong...! ${e}` });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already Exists!" });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      username: username,
      password: hashedPass,
    });

    await newUser.save();
    res
      .status(httpStatus.CREATED)
      .json({ message: "User created successfully!" });
  } catch (e) {
    res.json({ message: `Something went wrong ${e}` });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required." });
    }
    const token = authHeader.split(" ")[1];

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found for this token." });
    }

    const meetings = await Meeting.find({ user_id: user.username });
    res.status(200).json(meetings);
  } catch (e) {
    res.status(500).json({ message: `Something went wrong: ${e}` });
  }
};


const addToHistory = async (req, res) => {
  const { meetingCode } = req.body;
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required." });
    }
    const token = authHeader.split(" ")[1];
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found for this token." });
    }

    const existingMeeting = await Meeting.findOne({
      user_id: user.username,
      meetingCode: meetingCode,
    });

    if (existingMeeting) {
      return res.status(200).json({ message: "Meeting already in history." });
    }

    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meetingCode,
    });
    await newMeeting.save();
    res.status(201).json({ message: "Meeting added to history successfully." });

  } catch (e) {
    res.status(500).json({ message: `Something went wrong: ${e}` });
  }
};

export { login, register, getUserHistory, addToHistory, getMe };
