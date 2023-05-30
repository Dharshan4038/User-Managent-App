const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();
mongoose.connect("mongodb://localhost:27017/userAppDB",{useNewUrlParser:true});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const userSchema = {
    id: Number,
    name: String,
    email: String,
    gender: String,
    status: String
}


const User = mongoose.model('User',userSchema);

// Counter Schema for auto increment
const counterSchema = {
    id: String,
    seq: Number
}

const Counter = mongoose.model('Counter',counterSchema);

app.route('/')
    .get(function(req,res){
        User.find({})
        .then(function(foundUsers){
            res.render('home',{users:foundUsers})
            // res.send(foundUsers);
        })
        .catch(function(err){
            res.send(err);
        })
    });

app.get("/adduser",function(req,res){
    res.render("user");
})

app.route('/adduser')
    .post(function(req,res){
        Counter.findOneAndUpdate({id:"autoval"},{"$inc":{"seq":1}},{new:true})
        .then(function(cd){
            let seqId;
            if(cd === null) {
                const newval = new Counter({
                    id: "autoval",
                    seq: 1
                })
                newval.save();
                seqId = 1;
            } else {
                seqId = cd.seq;
            }
            const user = new User({
                id: seqId,
                name: req.body.name,
                email: req.body.email,
                gender: req.body.gender,
                status: req.body.status
            })
            user.save();
            res.redirect("/");
        })
        .catch(function(err){
            res.send(err);
        })
        // res.send("User Added Successfully");
    });

app.get('/userupdate/:userId',function(req,res){
    User.findOne({_id: req.params.userId })
    .then(function(foundUser){
        console.log(foundUser);
        res.render('update',{user: foundUser })
    })
    .catch(function(err){
        res.send(err);
    })
});

app.post('/update',function(req,res){
    console.log(req.body);
    User.updateOne({_id: req.body._id },{$set: {id: req.body.id,name: req.body.name,email: req.body.email,gender: req.body.gender,status: req.body.status}})
    .then(function(){
        console.log("Updated Successfully");
        res.redirect("/");
    })
    .catch(function(err){
        res.send(err);
    })
    
});

app.get('/userdelete/:userId',function(req,res) {

    User.deleteOne({_id: req.params.userId })
    .then(function(){
        console.log("Deleted Successfully");
    })
    .catch(function(err){
        res.send(err);
    })
    res.redirect("/");
});




app.listen(3000, function() {
    console.log("Server started on port 3000");
});
  