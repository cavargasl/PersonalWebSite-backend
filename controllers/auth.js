const jwt = require('../services/jwt');
const moment = require('moment');
const User = require('../models/user');

function willExpiredToken(token) {
    const {exp} = jwt.decodeToken(token);
    const currentDate = moment().unix();

    if(currentDate > exp) {
        return true;
    }
    return false;
}

function refreshAccessToken(req, res) {
    const {refreshToken} = req.body;    
    const ifTokenExpired = willExpiredToken(refreshToken);
    
    if(ifTokenExpired) {
        res.status(404).send({message: "El refresh token ha expirado"});
    }else {
        const {id} = jwt.decodeToken(refreshToken);

        User.findOne({_id: id}, (err, userStored) => {
            if(err){
                res.status(500).send({message: "error del servidor al encontrar usuario"})
            }else {
                if(!userStored){
                    res.status(404).send({message: "usuario no encontrado, inexistente"})
                }else{
                    res.status(200).send({accessToken: jwt.createAccessToken(userStored), refreshToken: refreshToken})
                }
            }
        })
    }
}

module.exports = {
    refreshAccessToken
};