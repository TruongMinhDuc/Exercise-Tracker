const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL);

const { Schema } = mongoose;

const userSchema = new Schema({ username: String });
const User = mongoose.model("User", userSchema);

const exerciseSchema = new Schema({
  _uid: { type: String, require: true },
  description: String,
  duration: Number,
  date: Date,
});
const Exercises = mongoose.model("Exercises", exerciseSchema);

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async function (req, res) {
  const userObj = new User({ username: req.body.username });
  user = await userObj.save();
  res.json({ username: user.username, _id: user._id });
});

app.get("/api/users", async (req, res) => {
  const users = await User.find({}).select("_id username");
  res.json(users);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  user = await User.findById(req.params._id);

  if (user) {
    //console.log(des, dur, date);
    const exObj = new Exercises({
      _uid: user._id,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    });
    const ex = await exObj.save();
    res.json({
      username: user.username,
      description: ex.description,
      duration: ex.duration,
      date: new Date(ex.date).toDateString(),
      _id: user._id,
    });
  }
});
app.get("/api/users/:_id/logs", async (req, res) => {
  let id = req.params._id;
  let { from, to, limit } = req.query;
  let fillter = { _uid: id };
  let dateObj = {};

  if (from) {
    dateObj["$gte"] = new Date(from);
  }

  if (to) {
    dateObj["$lte"] = new Date(to);
  }
  if (from || to) {
    fillter.date = dateObj;
    console.log(dateObj);
  }

  const user = await User.findById(id);
  const exs = await Exercises.find(fillter).limit(+limit);

  const log = exs.map((e) => ({
    description: e.description,
    duration: e.duration,
    date: new Date(e.date).toDateString(),
  }));
  //console.log(from.toDateString(), to.toDateString(), limit.toDateString());
  res.json({
    username: user.username,
    count: exs.length,
    _id: user.id,
    log,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
