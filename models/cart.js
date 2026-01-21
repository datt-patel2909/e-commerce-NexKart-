const mongoose=require('mongoose')

const cartschema= mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:[{
        _id:false,
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"product",
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1,
        default:1
    },
    price:Number
}
    ]
},{timestamps:true})

module.exports=mongoose.model("Cart",cartschema)