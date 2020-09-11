const express = require('express')
const moment = require('moment')
const router = express.Router()

const { Record } = require('../util/dbcon');
const { respondMsg } = require('../util/response');
const { verifySubject, verifyQuestionID } = require('../util/verifyData')


// 添加笔记
router.post('/addNote', (req, res) => {
    let obj = req.body;
    verifyQuestionID(res, obj.id).then((isEffective) => {
        if(!isEffective) {
            respondMsg(res, 1, '题目id不合法');
            return;
        }
        //是否有此记录
        Record.findOne({openID: obj.openID, quesID: obj.id}, (err, resObj1) => {
            if(err) {
                respondMsg(res, 1, '数据库操作失败');
                return;
            }
            if(!resObj1) {
                //添加记录
                Record.create({openID: obj.openID, quesID: obj.id, note: obj.note, 
                    noteCreatedTime: Date.now()}, (err, resObj2) => {
                    if(err) {
                        respondMsg(res, 1, '数据库操作失败');
                        return;
                    }
                    respondMsg(res, 0, '成功添加笔记');
                })
                return;
            }
            //修改记录
            else {
                Record.updateOne({openID: obj.openID, quesID: obj.id}, {note: obj.note, 
                    noteCreatedTime: Date.now()}, (err, resObj2) => {
                    if(err) {
                        respondMsg(res, 1, '数据库操作失败');
                        return;
                    }
                    respondMsg(res, 0, '成功修改笔记');
                });
                return;
            }
        })
    });
})

//获取某题的笔记
router.post('/getNote', (req, res) => {
    let obj = req.body;
    Record.aggregate([
        {
            $lookup: {
                from: 'userinfos',
                localField: 'openID',
                foreignField: 'openID',
                as: 'user'
            }
        },
        {$unwind: '$user'},
        {$match: {openID: obj.openID, quesID: obj.id}}
    ]).exec((err, record) => {
        if(record.length == 0) {
            respondMsg(res, 1, '暂无笔记');
            return;
        }
        else if(record[0].note == null) {
            respondMsg(res, 1, '暂无笔记');
            return;
        }
        else {
            respondMsg(res, 0, '查询成功', {
                avatar: record[0].user.avatar,
                nickname: record[0].user.nickname,
                note: record[0].note,
                createTime: moment(record[0].noteCreatedTime).format('YYYY-MM-DD HH:mm')
            });
        }
    })
})

//删除笔记
router.post('/deleteNote', (req, res) => {
    let obj = req.body;
    verifyQuestionID(res, obj.id).then((isEffective) => {
        if(!isEffective) {
            respondMsg(res, 1, '题目id不合法');
            return;
        }
        Record.findOne({openID: obj.openID, quesID: obj.id}, (err, resObj1) => {
            if(err) {
                respondMsg(res, 1, '数据库操作失败');
                return;
            }
            if(resObj1) {
                Record.updateOne({openID: obj.openID, quesID: obj.id}, {note: null}, (err, resObj2) => {
                    if(err) {
                        respondMsg(res, 1, '数据库操作失败');
                        return;
                    }
                    respondMsg(res, 0, '笔记删除成功');
                    return;
                })
            }
            else {
                respondMsg(res, 1, '笔记不存在');
                return;
            }
        })
    })
})

//获取用户某科目下的所有笔记 
router.post('/getSubjectNotes', (req, res) => {
    let obj = req.body;
    if(!verifySubject(obj.subject)) {
        respondMsg(res, 1, '科目输入不合法');
        return;
    }
    Record.aggregate([
        {
            $lookup: {
                from: 'questions',
                localField: 'quesID',
                foreignField: 'id',
                as: 'questions'
            }
        },
        {$unwind: '$questions'},
        {$match: {openID: obj.openID, 'questions.subject': obj.subject, note: {'$ne': null, $exists: true}}}
    ]).exec((err, records) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        if(records.length == 0) {
            respondMsg(res, 1, '暂无笔记');
            return;
        }
        let data = [];
        records.forEach(item => {
            data.push({
                id: item.quesID,
                question:item.questions.question,
                note: item.note,
                createTime: moment(item.noteCreatedTime).format('YYYY-MM-DD HH:mm')
            })
        });
        respondMsg(res, 0, '查询成功', data);
    })
})

module.exports = router