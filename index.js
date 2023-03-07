const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/Users");
const movieRoutes = require("./routes/Movies");
const listRoutes = require("./routes/Lists");
var cors = require("cors");
dotenv.config();
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Db connection successful"))
  .catch((err) => console.log(err));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/lists", listRoutes);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

app.listen(8800, () => {
  console.log("Backend server running");
});
