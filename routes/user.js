const express = require('express')
const router = express.Router();//可使用 express.Router 类创建模块化、可挂载的路由句柄

const UserInfo = require('../util/dbcon').UserInfo

//获取用户昵称
router.post('/getUser', (req, res) => {
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
        }
    })
})

//存入用户头像和昵称
router.post('/saveUser', (req, res) => {
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
router.post('/saveUserInfo', (req, res) => {
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
router.post('/getUserInfo', (req, res) => {
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

module.exports = router