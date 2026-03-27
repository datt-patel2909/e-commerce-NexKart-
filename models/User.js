const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema= new mongoose.Schema({
     name:{
        type: String,
        required:[true,'please provide a name'],
        minlength:3,
        maxlenth:50
    },
    email:{
        type: String,
        required:[true,'please provide a email'],
        minlength:3,
        maxlenth:50,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ],
        unique:true
    },
    password:{
        type: String,
        required: function() {
            // Password is only required if user is NOT an OAuth user
            return !this.googleId;
        },
        minlength:6,
        maxlenth:12
    },
    googleId: {
        type: String,
        default: null
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    }
})
userSchema.pre('save',async function (){
    // Only hash the password if it was modified (skip for OAuth users or unchanged passwords)
    if (!this.isModified('password') || !this.password) return;
    const salt=await bcrypt.genSalt(10)
    this.password= await bcrypt.hash(this.password,salt)

})
userSchema.methods.createJWT = function() {
    return jwt.sign({userId: this._id, name: this.name,role:this.role}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
}
userSchema.methods.comparePassword = async function(candidatepassword) {
    const isMatch = await bcrypt.compare(candidatepassword, this.password)
    return isMatch
}
const User=mongoose.model('User',userSchema)
module.exports=User;