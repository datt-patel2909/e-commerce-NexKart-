const User=require('../models/User')
const {StatusCodes}=require('http-status-codes')
const{BadRequestError,UnauthenticatedError}=require('../errors/index')

const register=async(req,res)=> {
        
        const user=await User.create({...req.body,role:"user"})
        const token= user.createJWT()
        res.status(StatusCodes.CREATED).json({user:{name:user.name,role:user.role},token})
  
}

const login=async(req,res)=> {
    const{email,password}=req.body 
    if(!email || !password)
    {
        throw new BadRequestError('Please Provide Email and Password')
    }
    const user= await User.findOne({email})
    if(!user)
    {
        throw new UnauthenticatedError('Invalid credential ')
    }
    if(!password)
    {
        throw new UnauthenticatedError('Invalid credential')

    }
    const token=user.createJWT()
    res.status(StatusCodes.OK).json({user:{_id:user._id,name:user.name,role:user.role},token})

}

module.exports={register,login}
