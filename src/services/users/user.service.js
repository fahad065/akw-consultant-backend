const config = require("../../config/config")
const CryptoJS = require("crypto-js")
const { Role } = require("../../models")
const { ObjectId } = require("mongodb")
const userMailValidation = async (body) => {
    try {
        const { email, password, type, otp } = body;
        email = email.toLowerCase().trim();
        const encrypt_email = CryptoJS.AES.encrypt(email, config.jwt.secret).toString();
        const centralBody = {
            email: encrypt_email,
            product_id: process.env.CENTRAL_DB_PRODUCT_ID,
            type: type,
            otp: otp
        };
        const URL = config.urls.central_url + 'users/centralLogin';
        try {
            const responseCentral = await axios.post(URL, centralBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const product_access = responseCentral.data.data;
            const access = product_access.filter(prod => prod.product_id === process.env.CENTRAL_DB_PRODUCT_ID);
            if (responseCentral.data.success && access.length > 0) {
                return true;
            } else {
                return null;
            }
        } catch (error) {
            throw new Error('An error occurred during central mail validation.');
        }
    } catch (error) {
        throw error
    }
};


const getRoleById = async (roleId) => {
    try {
        const sql = "SELECT * FROM roles WHERE _id = ?";
        return new Promise((resolve, reject) => {
            db.get(sql, [roleId.toString()], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    } catch (error) {
        throw error;
    }
};



module.exports = {
    userMailValidation,
    getRoleById,

}