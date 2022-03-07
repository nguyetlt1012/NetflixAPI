const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const verify = require("../verifyToken");
// update
router.put("/:id", verify,  async (req, res)=>{
    if(req.user.id === req.params.id || req.user.isAdmin){
        if(req.body.password){
            req.body.password = CryptoJS.AES.encrypt(
                req.body.password,
                process.env.SECRET_KEY
            ).toString();
        }
        try{
            const updateUser = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            }, {
                new: true,
            });
            res.status(200).json(updateUser);
        }catch(err){
            res.status(500).json(err);
        }
    } else{
        res.status(403).json("you can update only your account!");
    }
} )


// delete
router.delete("/:id", verify,  async (req, res)=>{
    if(req.user.id === req.params.id || req.user.isAdmin){
        try{
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("delete");
        }catch(err){
            res.status(500).json(err);
        }
    } else{
        res.status(403).json(req.user);
    }
} )



// get 
router.get("/find/:id", verify,  async (req, res)=>{
    
        try{
            const user = await User.findById(req.params.id);
            const {password,... info} = user._doc;
            res.status(200).json({... info});
        }catch(err){
            res.status(500).json(err);
        }
} )


// get all
router.get("/", verify, async (req, res) => {
    const query = req.query.new;
    if (req.user.isAdmin) {
      try {
        const users = query
          ? await User.find().sort({ _id: -1 }).limit(5)
          : await User.find();
        res.status(200).json(users);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("You are not allowed to see all users!");
    }
  });

module.exports = router