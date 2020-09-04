const express = require('express')
const router = express.Router()

const Question = require('../util/dbcon').Question

//获取某科目的所有题目
router.get('/getSubject', (req, res) => {
    let obj = req.body;
    Question.find({subject: obj.subject}, (err, resObj) => {
        if(err) {
            res.send(JSON.stringify({
                code: 1,
                msg: '查询失败'
            }))
            return;
        }
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
        res.send(JSON.stringify({
            code: 0,
            msg: '查询成功',
            data: data
        }))
    })
})

//获取某科目某章节的所有题目
router.get('/getChapter', (req, res) => {
    let obj = req.body;
    Question.find({subject: obj.subject, chapter: obj.chapter}, (err, resObj) => {
        if(err) {
            res.send(JSON.stringify({
                code: 1,
                msg: '查询失败'
            }))
            return;
        }
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
        res.send(JSON.stringify({
            code: 0,
            msg: '查询成功',
            data: data
        }))
    })
})

//获取随机的50道题
router.get('/getRandom', (req, res) => {
    Question.find((err, resObj) => {
        if(err) {
            res.send(JSON.stringify({
                code: 1,
                msg: '查询失败'
            }))
            return;
        }
        let arr = [];
        resObj.forEach(item => {
            arr.push(item);
        });
        let data = [], randArr = [], len = arr.length;
        while(randArr.length < 50) {
            let tmp = parseInt(Math.random() * len);
            if(randArr.includes(tmp)){
                continue;
            }
            randArr.push(tmp);
            data.push(arr[tmp]);
        }
        res.send(JSON.stringify({
            code: 0,
            msg: '查询成功',
            data: data
        }))
    })
})

//获取某科目的一套模拟题（单选16道，多选17道）
router.get('/getSimulation', (req, res) => {
    let obj = req.body;
    //单选
    Question.find({subject: obj.subject}, (err, resObj) => {
        if(err) {
            res.send(JSON.stringify({
                code: 1,
                msg: '查询失败'
            }))
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
        res.send(JSON.stringify({
            code: 0,
            msg: '查询成功',
            data: {
                single: dataSingle,
                plural: dataPlural
            }
        }))
    })
})

module.exports = router
