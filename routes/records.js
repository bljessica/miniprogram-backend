const express = require('express');
const router = express.Router();

const { SUBJECTS } = require('../util/const');
const { respondDBErr, respondMsg } = require('../util/response');
const { UserInfo, Question, Record } = require('../util/dbcon');
const { verifySubject, verifyQuestionID } = require('../util/verifyData')
const { sortByChapter,  } = require('../util/processData');


//标记错题
router.post('/markFaulty', (req, res) => {
    let obj = req.body;
    verifyQuestionID(res, obj.id).then((isEffective) => {
        if(!isEffective) {
            respondMsg(res, 1, '题目id不合法');
            return;
        }
        //是否有此记录
        Record.findOne({openID: obj.openID, quesID: obj.id}, (err, resObj1) => {
            respondDBErr(err, res);
            if(!resObj1) {
                //添加记录
                Record.create({openID: obj.openID, quesID: obj.id, isWrong: true}, (err, resObj2) => {
                    respondDBErr(err, res);
                    respondMsg(res, 0, '成功添加错题记录');
                });
                return;
            }
            //修改记录
            else {
                Record.updateOne({openID: obj.openID, quesID: obj.id}, {isWrong: true}, (err, resObj2) => {
                    respondDBErr(err, res);
                    respondMsg(res, 0, '成功修改错题记录');
                })
            }
        })
    })
})

//收藏题目
router.post('/collect', (req, res) => {
    let obj = req.body;
    verifyQuestionID(res, obj.id).then((isEffective) => {
        if(!isEffective) {
            respondMsg(res, 1, '题目id不合法');
            return;
        }
        //查询是否有此题的记录
        Record.findOne({ openID: obj.openID, quesID: obj.id}, (err, resObj) => {
            respondDBErr(err, res);
            //更新记录内容
            if(resObj) {
                Record.updateOne({ openID: obj.openID, quesID: obj.id}, {isCollected: true}, (err, resObj) => {
                    respondDBErr(err, res);
                    respondMsg(res, 0, '成功收藏此题')
                })
            }
            //添加记录
            else {
                Record.create({ openID: obj.openID, quesID: obj.id, isCollected: true}, (err, resObj) => {
                    respondDBErr(err, res);
                    respondMsg(res, 0, '成功收藏此题')
                })
            }
        })
    });
})

//将某题加入已做过的题目
router.post('/markDone', (req, res) => {
    let obj = req.body;
    verifyQuestionID(res, obj.id).then((isEffective) => {
        if(!isEffective) {
            respondMsg(res, 1, '题目id不合法');
            return;
        }
        //查询是否有此题的记录
        Record.findOne({ openID: obj.openID, quesID: obj.id}, (err, resObj1) => {
            respondDBErr(err, res);
            //如果此题已经做过
            if (resObj1) {
                respondMsg(res, 0, '此题已做过')
                return;
            }
            else {
                Record.create({ openID: obj.openID, quesID: obj.id}, (err, resObj2) => {
                    respondDBErr(err, res);
                    respondMsg(res, 0, '标记成功')
                })
            }
        })
    });
})

//取消收藏某题
router.post('/cancelCollection', (req, res) => {
    let obj = req.body;
    //查询是否有此题的收藏记录
    Record.findOne({ openID: obj.openID, quesID: obj.id, isCollected: true}, (err, resObj1) => {
        respondDBErr(err, res);
        //取消收藏
        if(resObj1) {
            Record.updateOne({openID: obj.openID, quesID: obj.id}, {isCollected: false}, (err, resObj2) => {
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
        for(let i = 1; i <= SUBJECTS.length; i++) {
            //各科目总题数countQuestion
            Question.countDocuments({subject: i}, (err, countQuestion) => {
                respondDBErr(err, res);
                //表连接
                Record.aggregate([
                    {
                        $lookup: {
                            from: 'questions',
                            localField: 'quesID',
                            foreignField: 'id',
                            as: 'dones'
                        }
                    },
                    {$unwind: '$dones'},
                    {$match: {openID: obj.openID, 'dones.subject': i}},
                    {$group: {_id: '$isWrong', count: {$sum: 1}}},
                ]).exec((err, records) => {
                    let countWrong = 0, countDone = 0;
                    if(records.length != 0) {
                        // console.log(records)
                        countWrong = records[0].count;
                        countDone = records[1]? records[0].count + records[1].count: records[0].count;
                    }
                    data.push({
                        subject: i,
                        totalNum: countQuestion,
                        doneNum: countDone,
                        correctRate: countDone == 0 ? 0: parseInt((countDone - countWrong) / countDone * 100),
                        progress: parseInt((countDone / countQuestion) * 100)
                    })
                    if(data.length == 4) {
                        respondMsg(res, 0, '查询成功', data);return;
                    }
                })
            })  
        }
    })
})

//（暂未）某科目各章总题数+每章做过的题数
router.post('/chapterProgress', (req, res) => {
    let obj = req.body;
    if(!verifySubject(obj.subject)) {
        respondMsg(res, 1, '科目输入不合法');
        return;
    }
    let data = [];
    //总章节数chapterNum
    Question.find({subject: obj.subject}, (err, resObj1) => {
        respondDBErr(err, res);
        let chapterNum = resObj1[0].chapterNumber, data = [];
        for(let i = 1; i <= chapterNum; i++) {
            //章节题目数chapterQuestionNum
            Question.countDocuments({subject: obj.subject, chapterNumber: i}, (err, chapterQuestionNum) => {
                respondDBErr(err, res);
                //章节名chapter
                Question.findOne({subject: obj.subject, chapterNumber: i}, (err, resObj3) => {
                    respondDBErr(err, res);
                    let chapter = resObj3.chapter;
                    //每章节做过的题数
                    Record.aggregate([
                        {
                            $lookup: {
                                from: 'questions',
                                localField: 'quesID',
                                foreignField: 'id',
                                as: 'dones'
                            }
                        },
                        {$unwind: '$dones'},
                        {$match: {openID: obj.openID, 'dones.subject': obj.subject, 'dones.chapterNumber': i}},
                        // {$group: {_id: id,count: {$sum: 1}}},
                        // {$match: {openID: obj.openID}},
                        // {$num: 1}
                    ]).exec((err, records) => {
                        data.push({
                            chapterNumber: i,
                            chapter: chapter,
                            totalNum: chapterQuestionNum,
                            doneNum: records.length
                        })
                        if(data.length == chapterNum) {
                            sortByChapter(data).then(() => {
                                console.log('返回')
                                respondMsg(res, 0, '查询成功', data);
                            })
                        }
                    })
                })    
            })
        }  
    }).sort({chapterNumber: -1}).skip(0).limit(1);
})

//某题的所有用户正确率
router.get('/getCorrectRate', (req, res) => {
    let obj = req.query;
    //做过此题的人数
    Record.countDocuments({quesID: obj.id}, (err, countDone) => {
        respondDBErr(err, res);
        //做错此题的人数
        Record.countDocuments({quesID: obj.id, isWrong: true}, (err, countFaulty) => {
            respondDBErr(err, res);
            respondMsg(res, 0, '查询成功', {
                correctRate: countDone == 0 ? 0: parseInt((countDone - countFaulty) / countDone * 100)
            })
        })
    })
})


module.exports = router;