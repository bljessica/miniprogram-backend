const express = require('express');
const router = express.Router();

const Faulty = require('../util/dbcon').Faulty;
const Question = require('../util/dbcon').Question
const Collection = require('../util/dbcon').Collection


//标记错题
router.post('/markFaulty', (req, res) => {
    let obj = req.body;
    //查询是否有此题的记录
    Faulty.findOne({
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
            return;
        }
        //已标记
        if(resObj) {
            res.send(JSON.stringify({
                code: 0,
                msg: '错题已标记'
            }))
            return;
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
                    return;
                }
                res.send(JSON.stringify({
                    code: 0,
                    msg: '错题标记创建成功'
                }))
            })
        }
    })
})

//各科目总题数，做过的题数，正确率，进度(未测试)
router.post('/totalProgress', (req, res) => {
    let obj = req.body;
    let subjects = ['马原', '思修', '史纲', '毛概'], data = [];
    for(let item of subjects) {
        //各科目总题数
        Question.countDocuments({subject: item}, (err, countQuestion) => {
            if(err) {
                res.send(JSON.stringify({
                    code: 1,
                    msg: '数据库操作失败'
                }))
                return;
            }
            //做过的题数
            Done.countDocuments({openID: obj.openID, subject: item}, (err, countDone) => {
                if(err) {
                    res.send(JSON.stringify({
                        code: 1,
                        msg: '存入用户信息失败'
                    }))
                    return;
                }
                //错误的题数
                Faulty.countDocuments({openID: obj.openID, subject: item}, (err, countFaulty) => {
                    if(err) {
                        res.send(JSON.stringify({
                            code: 1,
                            msg: '存入用户信息失败'
                        }))
                        return;
                    }
                    data.push({
                        subject: item,
                        totalNum: countQuestion,
                        doneNum: countDone,
                        correctRate: (countDone - countFaulty) / countDone,
                        process: countDone / countQuestion
                    })
                    if(data.length == 4) {
                        res.send(JSON.stringify({
                            code: 0,
                            msg: '查询成功',
                            data: data
                        }))
                    }
                })
            })
        })  
    }
})

//某科目各章总题数+每章做过的题数(未测试)
router.post('/chapterProgress', (req, res) => {
    let obj = req.body;
    let data = [];
    //总章节数
    Question.find({subject: obj.subject}, (err1, resObj1) => {
        if(err1) {
            res.send(JSON.stringify({
                code: 1,
                msg: '数据库操作失败'
            }))
            return;
        }
        let chapterNum = resObj1[0].chapterNumber;
        for(let i in chapterNum) {
            //章节题目数
            Question.countDocuments({subject: obj.subject, chapterNumber: i}, (err2, chapterQuestionNum) => {
                if(err2) {
                    res.send(JSON.stringify({
                        code: 1,
                        msg: '数据库操作失败'
                    }))
                    return;
                }
                //章节名
                Question.findOne({subject: obj.subject, chapterNumber: i}, (err3, resObj3) => {
                    if(err3) {
                        res.send(JSON.stringify({
                            code: 1,
                            msg: '数据库操作失败'
                        }))
                        return;
                    }
                    let chapter = resObj3.chapter;
                    //每章节做过的题数
                    Done.countDocuments({openID: obj.openID, subject: obj.subject, chapterNum: i}, (err4, countChapterDone) => {
                        if(err4) {
                            res.send(JSON.stringify({
                                code: 1,
                                msg: '数据库操作失败'
                            }))
                            return;
                        }
                        data.push({
                            chapterNumber: i,
                            chapter: chapter,
                            totalNum: chapterQuestionNum,
                            doneNum: countChapterDone
                        })
                        if(data.length == chapterNum) {
                            res.send(JSON.stringify({
                                code: 0,
                                msg: '查询成功',
                                data: data
                            }))
                        }
                    })
                })    
            })
        }  
    }).sort({chapterNumber: -1}).skip(0).limit(1);
})

//收藏题目
router.post('/collect', (req, res) => {
    let obj = req.body;
    //查询是否有此题的记录
    Collection.findOne({
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
            return;
        }
        //更新记录内容
        if(resObj) {
            res.send(JSON.stringify({
                code: 0,
                msg: '此题已收藏'
            }))
        }
        //添加记录
        else {
            Collection.create({
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
                    return;
                }
                res.send(JSON.stringify({
                    code: 0,
                    msg: '成功收藏此题'
                }))
            })
        }
    })
})

//取消收藏某题
router.post('/cancelCollection', (req, res) => {
    let obj = req.body;
    //查询是否有此题的记录
    Collection.findOne({
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
            return;
        }
        //取消收藏
        if(resObj) {
            Collection.remove({
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
                    return;
                }
                res.send(JSON.stringify({
                    code: 0,
                    msg: '成功取消收藏'
                }))
            })
        }
        //未收藏此题
        else {
            res.send(JSON.stringify({
                code: 1,
                msg: '此题未收藏'
            }))
        }
    })
})


module.exports = router;