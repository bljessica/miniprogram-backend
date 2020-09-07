const express = require('express')
const router = express.Router()

const { Question, Record } = require('../util/dbcon')
const { respondDBErr, respondMsg } = require('../util/response');
const { verifySubject } = require('../util/verifyData')
const { countWrongRecords } = require('../util/processData')

//获取某科目的所有题目
router.get('/getSubject', (req, res) => {
    let obj = req.body;
    if(!verifySubject(obj.subject)) {
        respondMsg(res, 1, '科目输入不合法');
        return;
    }
    Question.find({subject: obj.subject}, null, {chapterNumber: 1, quesNumber: 1}, (err, resObj) => {
        respondDBErr(err, res);
        let data = [];
        resObj.forEach(item => {
            data.push({
                chapterNumber: item.chapterNumber,
                chapter: item.chapter,
                type: item.type,
                quesNumber: item.quesNumber,
                question: item.question,
                A: item.A,
                B: item.B,
                C: item.C, 
                D: item.D,
                answer: item.answer,
                tip: item.tip
            });
        });
        respondMsg(res, 0, '查询成功', data);
    })
})

//获取某科目某章节的所有题目
router.get('/getChapter', (req, res) => {
    let obj = req.body;
    if(!verifySubject(obj.subject)) {
        respondMsg(res, 1, '科目输入不合法');
        return;
    }
    Question.find({subject: obj.subject, chapterNumber: obj.chapterNumber}, null, {chapterNumber: 1, quesNumber: 1}, (err, resObj) => {
        respondDBErr(err, res);
        let data = [];
        resObj.forEach(item => {
            data.push({
                type: item.type,
                quesNumber: item.quesNumber,
                question: item.question,
                A: item.A,
                B: item.B,
                C: item.C, 
                D: item.D,
                answer: item.answer,
                tip: item.tip
            });
        });
        respondMsg(res, 0, '查询成功', data);
    })
})

//获取随机的20道题
router.get('/getRandom', (req, res) => {
    Question.find((err, resObj) => {
        respondDBErr(err, res);
        let arr = [];
        resObj.forEach(item => {
            arr.push(item);
        });
        let data = [], randArr = [], len = arr.length;
        while(randArr.length < 20) {
            let tmp = parseInt(Math.random() * len);
            if(randArr.includes(tmp)){
                continue;
            }
            randArr.push(tmp);
            //题目arr[tmp]的正确率
            let item = arr[tmp];
            //做过此题的人数
            Record.countDocuments({
                subject: item.subject, chapterNumber: item.chapterNumber, type: item.type, 
                quesNumber: item.quesNumber}, (err, countDone) => {
                respondDBErr(err, res);
                //做错此题的人数
                Record.countDocuments({ subject: item.subject, chapterNumber: item.chapterNumber, 
                    type: item.type, quesNumber: item.quesNumber, isWrong: true}, (err, countFaulty) => {
                    respondDBErr(err, res);
                    item.correctRate = countDone == 0 ? 0: (countDone - countFaulty) / countDone;
                    data.push({
                        correctRate: countDone == 0 ? 0: parseInt((countDone - countFaulty) / countDone * 100),
                        subject: item.subject,
                        chapter: item.chapter,
                        type: item.type,
                        quesNumber: item.quesNumber,
                        question: item.question,
                        A: item.A,
                        B: item.B,
                        C: item.C, 
                        D: item.D,
                        answer: item.answer,
                        tip:item.tip
                    });
                    if(data.length == 20) {
                        respondMsg(res, 0, '查询成功', data);
                    }
                })
            });
        }
    })
})

//获取一套模拟题（单选16道，多选17道）
router.get('/getSimulation', (req, res) => {
    //单选
    Question.find((err, resObj) => {
        respondDBErr(err, res);
        let arr = [];
        resObj.forEach(item => {
            arr.push(item);
        });
        let dataSingle = [], randArrSingle = [], len = arr.length, 
            dataPlural = [], randArrPlural = [];
        while(randArrSingle.length < 16) {
            let tmp = parseInt(Math.random() * len);
            if(randArrSingle.includes(tmp)){
                continue;
            }
            let ques = arr[tmp];
            if(ques.type == 1) { //单选
                randArrSingle.push(tmp);
                dataSingle.push(ques);
            } 
        }
        while(randArrPlural.length < 17 ) {
            let tmp = parseInt(Math.random() * len);
            if(randArrPlural.includes(tmp)){
                continue;
            }
            let ques = arr[tmp];
            if(ques.type == 2) { //多选
                randArrPlural.push(tmp);
                dataPlural.push(ques);
            }
        }
        respondMsg(res, 0, '查询成功', {
            single: dataSingle,
            plural: dataPlural
        })
    })
})

//错题重练（随机20道， 小于则全返回）
router.post('/getWrong', (req, res) => {
    let obj = req.body;
    Record.find({openID: obj.openID, isWrong: true}, (err, resObj1) => {
        respondDBErr(err, res);
        let data = [];
        countWrongRecords(obj).then(count => {
            resObj1.forEach(record => {
                Question.findOne({subject: record.subject, chapterNumber: record.chapterNumber, 
                    type: record.type, quesNumber: record.quesNumber}, (err, resObj2) => {
                        respondDBErr(err, res);
                        console.log(resObj2)
                        data.push(resObj2);
                        if(data.length == count) {
                            respondMsg(res, 0, '查询成功', data)
                        }
                });
            })
        })
    }).limit(20);
})

module.exports = router
