const express = require('express')
const router = express.Router()

const { Record } = require('../util/dbcon');
const { processSubject, processType, verifyOpenID } = require('../util/processReq');
const { respondDBErr, respondMsg } = require('../util/response');


// 添加笔记
router.post('/addNote', (req, res) => {
    let obj = req.body;
    obj.subject = processSubject(obj.subject);
    if(!obj.subject) {
        respondMsg(res, 1, '科目输入不合法');
        return;
    }
    obj.type = processType(obj.type);
    if(!obj.type) {
        respondMsg(res, 1, '题目类型输入不合法');
        return;
    }
    //是否有此记录
    Record.findOne({ openID: obj.openID,  subject: obj.subject, chapterNumber: obj.chapterNumber,
        type: obj.type, quesNumber: obj.quesNumber}, (err, resObj1) => {
        respondDBErr(err, res);
        if(!resObj1) {
            //添加记录
            Record.create({openID: obj.openID, subject: obj.subject, chapterNumber: obj.chapterNumber, 
                type: obj.type, quesNumber: obj.quesNumber, note: obj.note}, (err, resObj2) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '成功添加笔记');
            })
            return;
        }
        //修改记录
        else {
            Record.updateOne({openID: obj.openID, subject: obj.subject, chapterNumber: obj.chapterNumber, 
                type: obj.type, quesNumber: obj.quesNumber}, {note: obj.note}, (err, resObj2) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '成功修改笔记');
            })
        }
    })
})

module.exports = router