const jwt = require('jsonwebtoken')
const CryptoJS = require("crypto-js");
const { User, Token, Role } = require('./models')

module.exports = {
    validateToken: async (req, res, next) => {
        let result;
        const authHeader = req.headers.authorization || req.headers.Authorization;
        
        if(authHeader){
            const token = req.headers.authorization.split(' ')[1] || req.headers.Authorization.split(' ')[1];
            const option = {
                expiresIn: '2d',
                //issuer: 'https://client.nathanhr.ae'
            }
 
            try {
                result = jwt.verify(token, process.env.JWT_KEY, option);
                if (result._id) {
                    req.user = await User.findById(result._id).select('_id first_name last_name role').exec();
                    let roleData = await Role.findById(req.user.role)
                    req.user.role = roleData
                }
                req.decode = result;
                next()
            } catch( err) {
                res.status(500).send(err)
            }

        } else {
            result = {
                error: `Authentication error. Token required`,
                status: 401
            }
            res.status(500).send(result)
        }
    },
    validateAccessToken: async (req, res, next) => {
        let payload;
        const authHeader = req.headers.authorization || req.headers.Authorization;
        
        if(authHeader){
            const token = req.headers.authorization.split(' ')[1] || req.headers.Authorization.split(' ')[1];
 
            try {
                payload = jwt.verify(token, process.env.JWT_KEY);
     
                const user = await User.findById(payload._id).select('_id first_name last_name').exec();

                req.decode = payload;
                if (user) {
                    req.user = user;
                    next()
                } else {
                    res.status(500).send('User not found')
                }
            } catch(err) {
                res.status(401).send(err)
            }

        } else {
            payload = {
                error: `Authentication error. Token required`,
                status: 401
            }
            res.status(500).send(payload)
        }
    },
    validateRefreshToken: async (req, res, next) => {
        let payload;
        const authHeader = req.body.refreshToken;
        
        if(authHeader){
            const token = req.body.refreshToken

            try {
                const type = 'refresh'
                const refreshTokenDoc = await verifyToken(token, type);

                if(!refreshTokenDoc) {
                    res.status(401).send('User not found')
                } else {
                    req.user = refreshTokenDoc.user;
                    next()
                }
            } catch( err) {
                res.status(401).send(err)
            }

        } else {
            payload = {
                error: `Authentication error. Token required`,
                status: 401
            }
            res.status(401).send(payload)
        }
    },
    logout: async (refreshToken) => {
        const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: 'refresh', blacklisted: false });
        if (!refreshTokenDoc) {
          return 'Not found'
        }
        await refreshTokenDoc.remove();
    },
}