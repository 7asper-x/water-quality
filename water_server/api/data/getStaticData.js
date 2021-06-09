const path = require('path');
const ROOT_PATH = global.appRoot;
const SAVE_PATH = '../staticData';
// decodeURI(req.params[0])
module.exports = function (req, res, next) {
    let mediaPath = path.join(ROOT_PATH, SAVE_PATH, decodeURI(req.params[0]));
    res.sendFile(mediaPath);
    return;

    function failHandle(reason, message='') {
        res.send({
            status: 'ERROR',
            reason: reason,
            message: message,
        });
    }
};