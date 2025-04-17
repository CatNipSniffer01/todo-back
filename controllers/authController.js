// api/controllers/authController.js
const db = require('../models');
const User = db.Users;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');

const transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateVerificationToken = (user)=>{
  return jwt.sign(
    {id:user.user_Id},
    process.env.JWT_SECRET,
    {expiresIn: '24h'}
  )
}


exports.register = async (req, res) => {
  try {
    const { userName, email, password, isAdmin } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email already exists
    const existingUserMail = await User.findOne({ where: { email } });
    if (existingUserMail) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const existingUserName = await User.findOne({ where: { userName } });
    if (existingUserName) {
      return res.status(400).json({ message: 'Username is already in use' });
    }

    // Validate password (example: at least 8 characters, one uppercase, one digit)
    if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with one uppercase letter and one number.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      acc_CR_D: new Date(),
      acc_UP_D: new Date(),
    });

    const token = generateVerificationToken(user);
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    try {
      await transporter.sendMail({
        from: `"To-Do, or not To-Do" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Registration Confirmation',
        text: `Thank you for registering to our To-Do Application!
        Please verify your email by clicking the link below:
        ${verificationLink}

        If you received this email by accident, feel free to ignore it.`
      });
    } catch (emailErr) {
      console.error('Error sending verification email:', emailErr);
      await user.destroy(); // Delete the user
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ message: 'Registration successful', emailNotifSent: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.verifyEmail = async (req,res)=>{
  const {token} = req.query;
  if(!token)
    return res.status(400).json({message:'Verification token missing'});

  try{
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
    const user = await User.findByPk(decodedToken.id);

    if(!user)
      return res.status(404).json({message:'User not found'});
    if(user.isEmailVerified)
      return res.status(400).json({message:'Email already verified'});

    user.isEmailVerified = true;
    await user.save();
    res.json({message:'Email verified successfully',user});
  }catch(err){
    res.status(400).json({message:'Invalid or expired token', error: err.message})
  }

}


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Invalid password' });
    if (!user.isEmailVerified){
      return res.status(403).json({message:'Email not verified'});
    }
    
    const token = jwt.sign(
      {
        id: user.user_Id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
