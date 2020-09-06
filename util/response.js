
function respondDBErr(err, res) {
    if(err) {
        res.send(JSON.stringify({
            code: 1,
            msg: '数据库操作失败'
        }))
        return;
    }
}

function respondMsg(res, code, msg, data) {
    res.send(JSON.stringify({
        code: code,
        msg: msg,
        data: data
    }))
}

module.exports.respondDBErr = respondDBErr;
module.exports.respondMsg = respondMsg;