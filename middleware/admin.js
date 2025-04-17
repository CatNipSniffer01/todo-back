const db = require('../models');

module.exports = async (req,res,next)=>{
    try{
        const user = await db.Users.findByPk(req.user.id);
        if(!user || !user.isAdmin){
            return res.status(403).json({ message: 'Forbidden: Action executable by admins only' });
        }
        req.freshUser = user;
        next();
    }
    catch(err){
        console.error('Admin check failed: ',err);
        res.status(500).json({ message: 'Admin check failed', error: err.message });
    }
}