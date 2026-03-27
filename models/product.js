const mongoose=require('mongoose')
const { timeStamp } = require('node:console')

const productschema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"please provide product name"],
        trim:true,
        maxlength:100,
    },
    description:{
        type:String,
        required:[true,"please provide product description"]
    },
    price:{
        type:Number,
        required:[true,"please provide price"],
        default:0,
        min:[0,"price cannot be negative"]
    },
    category:{
        type:String,
        enum:{
            values:["electroincs","fashion","home","books","other"],
            message:"please select from electronics, fashion, home, books, other"
        },
        default:"other"
    },
    stock:{
        type:Number,
        default:0,
        min:[0,"stock cannot be negative"]
    },
    image: {
  type: String,
  required: [true, "please provide product image"],
},
    bestSeller: {
    type: Boolean,
    default: false
    },
    colors: {
        type: [String],
        default: ['#222'],
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    }
},{timestamps:true})

module.exports=mongoose.model("product",productschema)
