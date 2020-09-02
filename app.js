const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const fs = require('fs');


const app = express();
app.use(bodyParser.json());//解析json数据格式
app.use(bodyParser.urlencoded({extended: false}));//解析form表单字段(Content-Type: application/x-www-form-urlencoded)



const url = 'mongodb://localhost/ques'

//创建集合
function createSet(dbase, setName) {
    dbase.createCollection(setName, (err, res) => {
        if(err) {
            console.log('创建集合失败')
            return;
        }
        console.log('创建集合成功')
        dbase.close();
    })
}

mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => console.log('数据库连接成功'))
    .catch((err) => console.log('数据库连接失败'))

const db = mongoose.connection;
//集合规则
const questionSchema = new mongoose.Schema({
    subject: String,
    chapterNumber: String,
    chapter: String,
    type: String,
    quesNumber: String,
    question: String,
    A: String,
    B: String,
    C: String, 
    D: String,
    answer: String,
    tip: String
})
const userInfoSchema = new mongoose.Schema({
    openID: {
        type: String,
        unique: true,
    },
    avatar: String,
    nickname: String,
    gender: {
        type: Number,
        enum: [1, 2]
    },
    school: String,
    goal: Number,
    motto: String,
    days_of_persistence: Number,
    correct_ratio: {
        type: Number,
        max: 1,
        min: 0
    },
})
//创建集合并应用规则
const Question = mongoose.model('Question', questionSchema)
const UserInfo = mongoose.model('Userinfo', userInfoSchema)

function saveQuestions() {
    // createSet(db, 'questions');
    fs.readFile('./output.txt', 'utf-8', (err, data) => {
        if (err){
            console.log('error')
        }
        let arr = JSON.parse(data);
        for(let question of arr){
            Question.create(question, (err, data) => {
                if(err){
                    console.log('error')
                    return
                }
            })
        }
        
    })
}

// app.get('/questions', (req, res) => {
//     // createSet(db, 'userinfo');
//     res.send(JSON.stringify({
//         code: 0,
//         msg: '成功'
//     }))
// })

//获取用户昵称
app.post('/getUser', (req, res) => {
    let obj = req.body;
    UserInfo.findOne({openID: obj.openID}, (err, resObj) => {
        if(err){
            res.send(JSON.stringify({
                code: 1,
                msg: '查询openID出错'
            }))
            return;
        }
        //存在此openID
        if(resObj) {
            res.send(JSON.stringify({
                code: 0,
                msg: '查询成功',
                data: {
                    nickname: resObj.nickname,
                    avatar: resObj.avatar
                }
            }))
        }
        //openID不存在
        else {
            res.send(JSON.stringify({
                code: 1,
                msg: '用户不存在',
            }))
            // UserInfo.create({openID: obj.openID, nickname: obj.nickname}, (err, data) => {
            //     if(err) {
            //         res.send(JSON.stringify({
            //             code: 1,
            //             msg: '创建用户数据失败'
            //         }))
            //         return;
            //     }
            //     res.send(JSON.stringify({
            //         code: 0,
            //         msg: '插入数据成功',
            //         data: {
            //             nickname: obj.nickname
            //         }
            //     }))
            // })
        }
    })
})

//存入用户头像和昵称
app.post('/saveUser', (req, res) => {
    let obj = req.body;
    if(obj.gender != 1 && obj.gender != 2){
        res.send(JSON.stringify({
            code: 1,
            msg: '性别输入错误'
        }))
        return;
    }
    UserInfo.create({
        openID: obj.openID,
        avatar: obj.avatar,
        gender: obj.gender,
        nickname: obj.nickname
    }, (err, data) => {
        if(err){
            res.send(JSON.stringify({
                code: 1,
                msg: '存入用户信息失败'
            }))
            return;
        }
        res.send(JSON.stringify({
            code: 0,
            msg: '存入用户信息成功'
        }))
    })
})

//更新用户信息
app.post('/saveUserInfo', (req, res) => {
    let obj = req.body;
    UserInfo.update({openID: obj.openID}, {
        avatar: obj.avatar,
        nickname: obj.nickname,
        gender: obj.gender,
        school: obj.school,
        goal: obj.goal,
        motto: obj.motto,
        days_of_persistence: obj.days_of_persistence,
        correct_ratio: obj.correct_ratio
    }, (err, data) => {
        if(err){
            res.send(JSON.stringify({
                code: 1,
                msg: '更新用户信息失败'
            }))
            return;
        }
        res.send(JSON.stringify({
            code: 0,
            msg: '成功更新用户信息'
        }))
    })
})

// 获取用户信息
app.post('/getUserInfo', (req, res) => {
    let obj = req.body;
    UserInfo.findOne({openID: obj.openID}, (err, resObj) => {
        if(err){
            res.send(JSON.stringify({
                code: 1,
                msg: '查询失败'
            }))
            return;
        }
        res.send(JSON.stringify({
            code: 0,
            msg: '查询成功',
            data: {
                avatar: resObj.avatar,
                nickname: resObj.nickname,
                gender: resObj.gender,
                school: resObj.school,
                goal: resObj.goal,
                motto: resObj.motto,
                days_of_persistence: resObj.days_of_persistence,
                correct_ratio: resObj.correct_ratio
            }
        }))
    })
})


//获取某科目的所有题目
app.get('/getSubject', (req, res) => {
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
app.get('/getChapter', (req, res) => {
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
app.get('/getRandom', (req, res) => {
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
app.get('/getSimulation', (req, res) => {
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
        while(randArrSingle.length < 16 || randArrPlural.length < 17 ) {
            let tmp = parseInt(Math.random() * len);
            if(randArrSingle.includes(tmp) || randArrPlural.includes(tmp)){
                continue;
            }
            let ques = arr[tmp];
            if(ques.type == '单') {
                randArrSingle.push(tmp);
                dataSingle.push(ques);
            } else {
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

const server = app.listen(3000, 'localhost', () => {
    let host = server.address().address
    let port = server.address().port

    console.log('服务器运行在http://%s:%s', host, port)
})