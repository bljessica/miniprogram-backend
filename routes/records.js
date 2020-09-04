const express = require('express')
const router = express.Router();

const Faulty = require('../util/dbcon').Faulty;

//标记错题
router.post('/markFaulty', (req, res) => {
    let obj = req.body;
    //查询是否有此题的记录
    Faulty.findOne({openID: obj.openID}, (err, resObj) => {
        if(err) {
            res.send(JSON.stringify({
                code: 1,
                msg: '数据库操作失败'
            }))
        }
        //更新记录内容
        if(resObj) {
            Faulty.update({openID: obj.openID}, {
                subject: obj.subject,
                chapterNumber: obj.chapterNumber,
                type: obj.type,
                quesNumber: obj.quesNumber
            }, (err, resObj) => {
                if(err) {
                    res.send(JSON.stringify({
                        code: 1,
                        msg: '数据库操作失败'
                    }))
                }
                res.send(JSON.stringify({
                    code: 0,
                    msg: '错题标记更新成功'
                }))
            })
        }
        //添加记录
        else {
            Faulty.create({
                openID: obj.openID,
                subject: obj.subject,
                chapterNumber: obj.chapterNumber,
                type: obj.type,
                quesNumber: obj.quesNumber
            }, (err, resObj) => {
                if(err) {
                    res.send(JSON.stringify({
                        code: 1,
                        msg: '数据库操作失败'
                    }))
                }
                res.send(JSON.stringify({
                    code: 0,
                    msg: '错题标记创建成功'
                }))
            })
        }
    })
})

module.exports = router;