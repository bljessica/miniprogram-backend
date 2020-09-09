const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

const { Question, Record } = require('../util/dbcon')
const { respondMsg, respondDBErr } = require('../util/response');
const { verifySubject } = require('../util/verifyData')
const { countWrongRecords } = require('../util/processData')

//获取某科目的所有题目
router.get('/getSubject', (req, res) => {
    let obj = req.query;
    if(!verifySubject(obj.subject)) {
        respondMsg(res, 1, '科目输入不合法');
        return;
    }
    Question.find({subject: obj.subject}, null, {chapterNumber: 1, quesNumber: 1}, (err, resObj) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        let data = [];
        resObj.forEach(item => {
            data.push(item)
        });
        respondMsg(res, 0, '查询成功', data);
    })
})

//获取某科目某章节的所有题目
router.get('/getChapter', (req, res) => {
    let obj = req.query;
    if(!verifySubject(obj.subject)) {
        respondMsg(res, 1, '科目输入不合法');
        return;
    }
    Question.find({subject: obj.subject, chapterNumber: obj.chapterNumber}, null, {chapterNumber: 1, quesNumber: 1}, (err, resObj) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        let data = [];
        resObj.forEach(item => {
            data.push(item);
        });
        respondMsg(res, 0, '查询成功', data);
    })
})

//获取随机的20道题
router.get('/getRandom', (req, res) => {
    Question.find((err, resObj) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
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
            Record.countDocuments({quesID: item.id}, (err, countDone) => {
                if(err) {
                    respondMsg(res, 1, '数据库操作失败');
                    return;
                }
                //做错此题的人数
                Record.countDocuments({quesID: item.id, isWrong: true}, (err, countFaulty) => {
                    if(err) {
                        respondMsg(res, 1, '数据库操作失败');
                        return;
                    }
                    item.correctRate = countDone == 0 ? 0: (countDone - countFaulty) / countDone;
                    data.push({
                        correctRate: countDone == 0 ? 0: parseInt((countDone - countFaulty) / countDone * 100),
                        id: item.id,
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
    });
})

//获取一套模拟题（单选16道，多选17道）
router.get('/getSimulation', (req, res) => {
    //单选
    Question.find((err, resObj) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
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
    Record.aggregate([
        {
            $lookup: {
                from: 'questions',
                localField: 'quesID',
                foreignField: 'id',
                as: 'wrong'
            }
        },
        {$match: {openID: obj.openID, isWrong: true}},
        {$unwind: '$wrong'},
        // {$limit: 20}
    ]).exec((err, records) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        if(records.length == 0) {
            respondMsg(res, 1, '暂无错题记录');
            return;
        }
        let arr = [];
        records.forEach((item, index) => {
            arr.push({
                id: item.quesID,
                isCollected: item.isCollected,
                subject: item.wrong.subject,
                chapter: item.wrong.chapter,
                type: item.wrong.type,
                quesNumber: item.wrong.quesNumber,
                question: item.wrong.question,
                A: item.wrong.A,
                B: item.wrong.B,
                C: item.wrong.C, 
                D: item.wrong.D,
                answer: item.wrong.answer,
                tip: item.wrong.tip
            });
        });
        let len = arr.length;
        if(len < 20) {
            for(let i = len - 1; i >= 0; i--) {
                let rand = Math.floor(Math.random() * len);
                let tmp = arr[i];
                arr[i] = arr[rand];
                arr[rand] = tmp;
            }
            respondMsg(res, 0, '查询成功', arr);
        }
        else {
            let data = [], randArr = [];
            while(data.length < 20) {
                let rand = Math.floor(Math.random() * len);
                if(!randArr.includes(rand)) {
                    randArr.push(rand);
                    data.push(arr[rand]);
                }
            }
            respondMsg(res, 0, '查询成功', data);
        }
    })
})

//获取收藏的题目
router.post('/getCollected', (req, res) => {
    let obj = req.body;
    Record.aggregate([
        {
            $lookup: {
                from: 'questions',
                localField: 'quesID',
                foreignField: 'id',
                as: 'collected'
            }
        },
        {$match: {openID: obj.openID, isCollected: true}},
        {$unwind: '$collected'}
    ]).exec((err, records) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        };
        if(records.length == 0){
            respondMsg(res, 1, '暂无笔记');
            return;
        }
        let data = [];
        records.forEach((item) => {
            data.push({
                id: item.quesID,
                chapterNumber: item.collected.chapterNumber,
                chapter: item.collected.chapter,
                type: item.collected.type,
                quesNumber: item.collected.quesNumber,
                question: item.collected.question,
                A: item.collected.A,
                B: item.collected.B,
                C: item.collected.C, 
                D: item.collected.D,
                answer: item.collected.answer,
                tip: item.collected.tip
            });
        })
        respondMsg(res, 0, '查询成功', data);
    })
})

module.exports = router
