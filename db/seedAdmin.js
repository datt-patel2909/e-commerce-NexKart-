require('dotenv').config();
const mongoose=require('mongoose')
const user=require('../models/User')

const start=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        const existing= await user.findOne({email:"Datt@gmail.com"})
        if(existing)
        {
            console.log("Admin already existing")
        }

        const admin=await user.create({
            name:"Datt",
            email:"datt123@gmail.com",
            password:"Datt123",
            role:"admin"
        })
        console.log("Admin created",admin.email)
        process.exit(0)

    }
    catch(err){
        console.error(err)
        process.exit(1)
    }
}
start()