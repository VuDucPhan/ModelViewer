require('dotenv').config();

let { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_BUCKET, PORT } = process.env;
if (!APS_CLIENT_ID || !APS_CLIENT_SECRET) {
    console.warn('Missing some of the environment variables.');
    // Chỉ thoát ứng dụng nếu không phải môi trường production
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
}
APS_BUCKET = APS_BUCKET || `${(APS_CLIENT_ID || 'default').toLowerCase()}-basic-app`;
PORT = PORT || 8080;

module.exports = {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET,
    APS_BUCKET,
    PORT
};
