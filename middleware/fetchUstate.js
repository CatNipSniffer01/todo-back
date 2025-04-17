const db = require ('../models');

module.exports = async (req, res, next) => {
    try{
        const user = await db.Users.findByPk(req.user.id);
        if(!user){
            return res.status(404).json({ message: 'User not found within database' });
        }
        req.freshUser = user;
        next();
    }
    catch(err){
        console.error('Could not refresh user',err);
        return res.status(500).json({ message: 'Could not load user profile', error: err.message });
    }
}