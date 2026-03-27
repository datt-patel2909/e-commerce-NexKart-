const User=require('../models/User')
const {StatusCodes}=require('http-status-codes')
const{BadRequestError,UnauthenticatedError}=require('../errors/index')
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    // If user signed up via Google and has no password
    if (!user.password) {
        throw new UnauthenticatedError('This account uses Google Sign-In. Please login with Google.')
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid credential')
    }

    const token=user.createJWT()
    res.status(StatusCodes.OK).json({user:{_id:user._id,name:user.name,role:user.role},token})

}

const googleLogin = async (req, res) => {
    const { credential } = req.body;
    
    if (!credential) {
        throw new BadRequestError('Google credential token is required');
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email } = payload;

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            throw new UnauthenticatedError('User does not exist. Please sign up first.');
        }

        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        const token = user.createJWT();
        res.status(StatusCodes.OK).json({
            user: { _id: user._id, name: user.name, role: user.role },
            token
        });

    } catch (error) {
        console.error('Google Login Error:', error);
        if (error instanceof UnauthenticatedError) {
            throw error;
        }
        throw new UnauthenticatedError('Google login failed');
    }
};

const googleSignup = async (req, res) => {
    const { credential } = req.body;
    
    if (!credential) {
        throw new BadRequestError('Google credential token is required');
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            throw new BadRequestError('User already exists. Please log in.');
        }

        user = await User.create({
            name,
            email,
            googleId,
            role: 'user'
        });

        const token = user.createJWT();
        res.status(StatusCodes.CREATED).json({
            user: { _id: user._id, name: user.name, role: user.role },
            token
        });

    } catch (error) {
        console.error('Google Signup Error:', error);
        if (error instanceof BadRequestError) {
            throw error;
        }
        throw new UnauthenticatedError('Google sign-up failed');
    }
};

module.exports={register,login,googleLogin,googleSignup}
