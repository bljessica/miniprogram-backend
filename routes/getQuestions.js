const express = require('express')
const router = express.Router()

const { Question } = require('../util/dbcon')
const { respondDBErr, respondMsg } = require('../util/response');
const { processSubject } = require('../util/processReq');


//获取某科目的所有题目
router.get('/getSubject', (req, res) => {
    let obj = req.body;
    obj.subject = processSubject(obj.subject)
    if(!obj.subject) {
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
    obj.subject = processSubject(obj.subject)
    if(!obj.subject) {
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
            data.push(arr[tmp]);
        }
        respondMsg(res, 0, '查询成功', data);
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
            if(ques.type == '单') {
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
            if(ques.type == '多') {
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

module.exports = router
