const express = require("express");
const router = express.Router();
const User = require("../models/User");
const brcypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CreateError = require("../utils");

//register
router.post("/register", async (req, res, next) => {
  const salt = await brcypt.genSalt(10);
  const hashedPassword = await brcypt.hash(req.body.password, salt);
  const newUser = new User({
    email: req.body.email,
    username: req.body.username,
    password: hashedPassword,
  });
  try {
    const user = await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    if (err.name === "ValidationError") {
      const error = Object.values(err.errors)
        .map((el) => el.message)
        .join(". ");
      const message = `Invalid Data.${error}`;
      return next(new CreateError(404, message));
    } else if (err.message.indexOf("11000") != -1) {
      // run some code here //
      return next(new CreateError(404, " Username or Email already exists!"));
    } else {
      return next(new CreateError(500, err));
    }
  }
});
//login
router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const validPassword = await brcypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return next(new CreateError(400, "Incorrect password!"));
      } else {
        const accessToken = jwt.sign(
          { id: user._id, isAdmin: user.isAdmin },
          process.env.SECRET_KEY,
          { expiresIn: "120d" }
        );

        const { password, ...info } = user._doc;
        res.status(200).json({ ...info, accessToken });
      }
    } else {
      return next(new CreateError(404, "User not found!"));
    }
  } catch (err) {
    return next(new CreateError(500, err));
  }
});

module.exports = router;
