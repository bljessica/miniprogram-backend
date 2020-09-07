
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

function sortByChapter(data) {
    return new Promise((resolve, reject) => {
        data.sort((a, b) => {
            return a.chapterNumber - b.chapterNumber;
        });
        resolve();
        console.log('排序成功');
    })
}

module.exports.respondDBErr = respondDBErr;
module.exports.respondMsg = respondMsg;
module.exports.sortByChapter = sortByChapter;