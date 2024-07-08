const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const moment = require('moment')
const { Token } = require('../models')

const GenerateToken = (user) => {
    try {

        const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');

        const Accesspayload = {
            _id: user._id,
            iat: moment().unix(),
            exp: accessTokenExpires.unix(),
            type: 'access',
        }

        const accessToken = jwt.sign(Accesspayload, process.env.JWT_KEY)

        /* Refresh token generation */
        const refreshTokenExpires = moment().add(process.env.JWT_REFRESH_EXPIRATION_HOURS, 'hours');

        const Refershpayload = {
            _id: user._id.toString(),
            iat: moment().unix(),
            exp: refreshTokenExpires.unix(),
            type: 'refresh',
        };

        const refreshToken = jwt.sign(Refershpayload, process.env.JWT_KEY)

        let token = {
            blacklisted: false,
            token: refreshToken,
            user: user._id.toString(),
            expires: refreshTokenExpires,
            type: 'refresh',
        }
        
        Token.findOneAndUpdate({"user": user._id.toString()}, token, { new: true });

        return accessToken;
    } catch (error) {
        console.log(error, '----error')
        throw error
    }

};


module.exports = { GenerateToken };
