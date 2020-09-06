const express = require('express');
const router = express.Router();

const subjects = require('../util/const').SUBJECTS;
const { respondDBErr, respondMsg } = require('../util/response');
const { processSubject, processType } = require('../util/processReq');
const { UserInfo, Question, Record } = require('../util/dbcon');


//标记错题
router.post('/markFaulty', (req, res) => {
    let obj = req.body;
    obj.subject = processSubject(obj.subject)
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
    Record.findOne({openID: obj.openID, subject: obj.subject, chapterNumber: obj.chapterNumber, 
        type: obj.type, quesNumber: obj.quesNumber}, (err, resObj1) => {
        respondDBErr(err, res);
        if(!resObj1) {
            //添加记录
            Record.create({openID: obj.openID, subject: obj.subject, chapterNumber: obj.chapterNumber, 
                type: obj.type, quesNumber: obj.quesNumber, isWrong: true}, (err, resObj2) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '成功添加错题记录');
            });
            return;
        }
        //修改记录
        else {
            Record.updateOne({openID: obj.openID, subject: obj.subject, chapterNumber: obj.chapterNumber, 
                type: obj.type, quesNumber: obj.quesNumber}, {isWrong: true}, (err, resObj2) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '成功修改错题记录');
            })
        }
    })
})

//收藏题目
router.post('/collect', (req, res) => {
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
    //查询是否有此题的记录
    Record.findOne({ openID: obj.openID,  subject: obj.subject, chapterNumber: obj.chapterNumber, 
        type: obj.type, quesNumber: obj.quesNumber}, (err, resObj) => {
        respondDBErr(err, res);
        //更新记录内容
        if(resObj) {
            Record.updateOne({ openID: obj.openID, subject: obj.subject, chapterNumber: obj.chapterNumber, 
                type: obj.type, quesNumber: obj.quesNumber}, {isCollected: true}, (err, resObj) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '成功收藏此题')
            })
        }
        //添加记录
        else {
            Record.create({ openID: obj.openID, subject: obj.subject, chapterNumber: obj.chapterNumber, 
                type: obj.type, quesNumber: obj.quesNumber, isCollected: true}, (err, resObj) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '成功收藏此题')
            })
        }
    })
})

//将某题加入已做过的题目
router.post('/markDone', (req, res) => {
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
    //查询是否有此题的记录
    Record.findOne({ openID: obj.openID, subject: obj.subject, chapterNumber: obj.chapterNumber, 
        type: obj.type, quesNumber: obj.quesNumber}, (err, resObj1) => {
        respondDBErr(err, res);
        //如果此题已经做过
        if (resObj1) {
            respondMsg(res, 0, '此题已做过')
            return;
        }
        else {
            Record.create({ openID: obj.openID, subject: obj.subject, chapterNumber: obj.chapterNumber, 
                type: obj.type, quesNumber: obj.quesNumber}, (err, resObj2) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '标记成功')
            })
        }
    })
})

//取消收藏某题
router.post('/cancelCollection', (req, res) => {
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
    //查询是否有此题的收藏记录
    Record.findOne({ openID: obj.openID, subject: obj.subject, chapterNumber: obj.chapterNumber, 
        type: obj.type, quesNumber: obj.quesNumber, isCollected: true}, (err, resObj1) => {
        respondDBErr(err, res);
        //取消收藏
        if(resObj1) {
            Record.updateOne({openID: obj.openID, subject: obj.subject, chapterNumber: obj.chapterNumber, 
                type: obj.type, quesNumber: obj.quesNumber}, {isCollected: false}, (err, resObj2) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '成功取消收藏');
            })
            return;
        }
        //未收藏此题
        else {
            respondMsg(res, 0, '此题未收藏过');
        }
    })
})

//各科目总题数，做过的题数，正确率，进度
router.post('/totalProgress', (req, res) => {
    let obj = req.body;
    let data = [];
    UserInfo.findOne({openID: obj.openID}, (err, resObj1) => {
        respondDBErr(err, res);
        if(!resObj1) {
            respondMsg(res, 1, '用户不存在');
            return;
        }
        for(let item of subjects) {
            //各科目总题数
            Question.countDocuments({subject: item}, (err, countQuestion) => {
                respondDBErr(err, res);
                //做过的题数
                Record.countDocuments({openID: obj.openID, subject: item}, (err, countDone) => {
                    respondDBErr(err, res);
                    //错误的题数
                    Record.countDocuments({openID: obj.openID, subject: item, isWrong: true}, (err, countFaulty) => {
                        respondDBErr(err, res);
                        data.push({
                            subject: item,
                            totalNum: countQuestion,
                            doneNum: countDone,
                            correctRate: countDone == 0 ? 0: (countDone - countFaulty) / countDone,
                            process: countDone / countQuestion
                        })
                        if(data.length == subjects.length) {
                            respondMsg(res, 0, '查询成功', data);
                        }
                    })
                })
            })  
        }
    })
})

//某科目各章总题数+每章做过的题数
router.post('/chapterProgress', (req, res) => {
    let obj = req.body;
    obj.subject = processSubject(obj.subject);
    if(!obj.subject) {
        respondMsg(res, 1, '科目输入不合法');
        return;
    }
    let data = [];
    //总章节数
    Question.find({subject: obj.subject}, (err, resObj1) => {
        respondDBErr(err, res);
        let chapterNum = resObj1[0].chapterNumber;
        for(let i = 1; i <= chapterNum; i++) {
            //章节题目数
            Question.countDocuments({subject: obj.subject, chapterNumber: i}, (err, chapterQuestionNum) => {
                respondDBErr(err, res);
                //章节名
                Question.findOne({subject: obj.subject, chapterNumber: i}, (err, resObj3) => {
                    respondDBErr(err, res);
                    let chapter = resObj3.chapter;
                    //每章节做过的题数
                    Record.countDocuments({openID: obj.openID, subject: obj.subject, 
                        chapterNumber: i}, (err, countChapterDone) => {
                        respondDBErr(err, res);
                        data.push({
                            chapterNumber: i,
                            chapter: chapter,
                            totalNum: chapterQuestionNum,
                            doneNum: countChapterDone
                        })
                        if(data.length == chapterNum) {
                            respondMsg(res, 0, '查询成功', data);
                        }
                    })
                })    
            })
        }  
    }).sort({chapterNumber: -1}).skip(0).limit(1);
})

//某题的所有用户正确率
router.get('/getCorrectRate', (req, res) => {
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
    //做过此题的人数
    Record.countDocuments({
        subject: obj.subject, chapterNumber: obj.chapterNumber, type: obj.type, 
        quesNumber: obj.quesNumber}, (err, countDone) => {respondDBErr(err, res);
            //做错此题的人数
            Record.countDocuments({ subject: obj.subject, chapterNumber: obj.chapterNumber, 
                type: obj.type, quesNumber: obj.quesNumber, isWrong: true}, (err, countFaulty) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '查询成功', {
                    correctRate: countDone == 0 ? 0: (countDone - countFaulty) / countDone
                })
            })
        })
})


module.exports = router;