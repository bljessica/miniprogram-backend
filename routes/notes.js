const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

const { Record } = require('../util/dbcon');
const { respondDBErr, respondMsg } = require('../util/response');


// 添加笔记
router.post('/addNote', (req, res) => {
    let obj = req.body;
    //是否有此记录
    Record.findOne({openID: obj.openID, quesID: obj.id}, (err, resObj1) => {
        respondDBErr(err, res);
        if(!resObj1) {
            //添加记录
            Record.create({openID: obj.openID, quesID: obj.id, note: obj.note}, (err, resObj2) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '成功添加笔记');
            })
            return;
        }
        //修改记录
        else {
            Record.updateOne({openID: obj.openID, quesID: obj.id}, {note: obj.note}, (err, resObj2) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '成功修改笔记');
            })
        }
    })
})

module.exports = router