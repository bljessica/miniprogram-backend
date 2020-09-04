const express = require('express')
const router = express.Router()

const Note = require('../util/dbcon').Note;

router.post('/addNote', (req, res) => {
    let obj = req.body;
    //查询是否有此题的笔记
    Note.findOne({openID: obj.openID}, (err, resObj) => {
        if(err) {
            res.send(JSON.stringify({
                code: 1,
                msg: '数据库操作失败'
            }))
        }
        //更新笔记内容
        if(resObj) {
            Note.update({openID: obj.openID}, {
                subject: obj.subject,
                chapterNumber: obj.chapterNumber,
                type: obj.type,
                quesNumber: obj.quesNumber,
                note: obj.note
            }, (err, resObj) => {
                if(err) {
                    res.send(JSON.stringify({
                        code: 1,
                        msg: '数据库操作失败'
                    }))
                }
            })
        }
    })
})

exports.router = router