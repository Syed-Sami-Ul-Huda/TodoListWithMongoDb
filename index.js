// require model
const TodoTask = require("./models/TodoTask");

const session = require("express-session");
const flash = require('connect-flash');
const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 3000;

// render css file
app.use("/static", express.static("public"));

// put form data into req.body
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));
  
  
// Express Messages Middleware
app.use(flash());
app.use(function(req, res, next){
    res.locals.add = req.flash('add');
    next();
});

// database connection
const mongoose = require("mongoose");
// connection to db
// if you find any warning in console so simply change this boolean value to true
mongoose.set("useFindAndModify", false);

mongoose.connect(process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true }, () => {
console.log("Connected to db!");
app.listen(5000, () => console.log(`Todo database is running on port 5000`));
});

// view engine configuration
app.set("view engine", "ejs");

// GET METHOD
app.get("/", (req, res) => {
    TodoTask.find({}, (err, tasks) => {
    res.render("todo.ejs", { todoTasks: tasks });
    });
    });

//POST METHOD
app.post('/', async (req, res) => {
    const todoTask = new TodoTask({
    content: req.body.content
    });
    try {
        if( req.body.content == ''){
            req.flash('add', "Sorry! You can't enter an empty task in list");
            res.redirect("/");
        }
    else{
    await todoTask.save();
    res.redirect("/");
    }}
    catch (err) {
    res.redirect("/");
    }
    });

//UPDATE
app.route("/edit/:id")
    .get((req, res) => {
    const id = req.params.id;
    TodoTask.find({}, (err, tasks) => {
    res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id });
    });
    })
    .post((req, res) => {
    const id = req.params.id;
    TodoTask.findByIdAndUpdate(id, { content: req.body.content }, err => {
    if (err) return res.send(500, err);
    res.redirect("/");
    });
    });

//DELETE
app.route("/remove/:id")
    .get((req, res) => {
    const id = req.params.id;
    TodoTask.findByIdAndRemove(id, err => {
    if (err) return res.send(500, err);
    res.redirect("/");
    });
    });

app.listen(port, () => console.log(`Todo App is running on port ${port}`));