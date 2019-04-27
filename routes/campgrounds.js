var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware/index.js");

router.get("/", function(req, res){
    //get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
        }
    });
   // res.render("campgrounds", {campgrounds:campgrounds});
});
//create
router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author= {
        id:req.user._id,
        username:req.user.username
    };
    var newCampground = {name: name, image:image, description: desc, author:author}
    
    //create a new campground and save to database
    Campground.create(newCampground, function(err, newlyCretead){
        if(err){
            console.log(err);     
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//SHOW - shows more infor about one campground

router.get("/:id", function(req,res){
    //find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
    //render show template with that campground
    //res.render("show");
});

//edit campground route
router.get("/:id/edit",  middleware.checkCampgroundOwnership, function(req,res){              //ovako radimo ako necemo napravit middleware koji gleda je li loggan acc i je li campground od tog acc-a
    // if(req.isAuthenticated()){
    //     Campground.findById(req.params.id, function(err, foundCampground){
    //         if(err){
    //             res.redirect("/campgrounds");
    //         } else {
    //             if(foundCampground.author.id.equals(req.user.id)){
    //                 res.render("campgrounds/edit", {campground: foundCampground});
    //             } else {
    //                 res.send("You are not allowed to do that!");
    //             }
    //         }
    //     });    
    // } else {
    //     res.send("You have to be logged in!");
    // }
    Campground.findById(req.params.id, function(err, foundCampground){
       res.render("campgrounds/edit", {campground:foundCampground});  //mozemo handle-at error ali i ne moramo, jer smo vec error check prosli u middleware 
    });
});

//update campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   //find and update the correct campground
 //  var data = {name: req.body.name, image: req.body.image, description:req.body.description}; //mozemo tako, i onda u edit file-u, za name od inputa, stavimo name, image itd
 //ili u edit fileu grupiramo name u campground[name], pa nam ne treba ovaj var data, smao u paramatre od find ubacimo req.body.campground
    
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
            //redirect somewhere (show page)
            res.redirect("/campgrounds/"+req.params.id);
       }
   });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndDelete(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});


//middleware



module.exports = router;