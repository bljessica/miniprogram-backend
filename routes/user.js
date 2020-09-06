const express = require('express');
const router = express.Router();//可使用 express.Router 类创建模块化、可挂载的路由句柄

const { UserInfo, Record } = require('../util/dbcon');
const { respondDBErr, respondMsg } = require('../util/response');
const { verifyOpenID, verifyGender, isNumber } = require('../util/processReq');


//获取用户昵称
router.post('/getUser', (req, res) => {
    let obj = req.body;
    UserInfo.findOne({openID: obj.openID}, (err, resObj) => {
        respondDBErr(err, res);
        //存在此openID
        if(resObj) {
            //剩余天数
            let daysRemaining = -1;
            if(resObj.daysOfPersistence && resObj.goal) {
                daysRemaining = resObj.goal - resObj.daysOfPersistence;
            }
            //用户个人正确率
            //用户做过的题数
            Record.countDocuments({openID: obj.openID}, (err, countDone) => {
                respondDBErr(err, res);
                //用户做错的题数
                Record.countDocuments({openID: obj.openID, isWrong: true}, 
                    (err, countFaulty) => {
                    respondDBErr(err, res);
                    respondMsg(res, 0, '查询成功', {
                                nickname: resObj.nickname,
                                avatar: resObj.avatar,
                                daysRemaining: daysRemaining,
                                correctRate: countDone == 0 ? 0: (countDone - countFaulty) / countDone
                            })
                })
            })
        }
        //openID不存在
        else {
            respondMsg(res, 1, '用户不存在')
        }
    })
})

//存入用户头像和昵称
router.post('/saveUser', (req, res) => {
    let obj = req.body;
    if (!verifyGender(obj.gender)) {
        respondMsg(res, 1, '性别输入不合法');
        return;
    }
    if(!verifyOpenID(obj.openID)) {
        respondMsg(res, 1, 'openID不合法');
        return;
    }
    //是否已经存过
    UserInfo.findOne({openID: obj.openID}, (err, resObj1) => {
        respondDBErr(err, res);
        //存过
        if(resObj1) {
            UserInfo.updateOne({ openID: obj.openID}, {avatar: obj.avatar, gender: obj.gender, 
                nickname: obj.nickname}, (err, resObj2) => {
                respondDBErr(err, res)
                respondMsg(res, 0, '更新用户信息成功')
                return;
            })
        }
        //没存过
        else {
            UserInfo.create({ openID: obj.openID, avatar: obj.avatar, gender: obj.gender, nickname: obj.nickname}, (err, resObj2) => {
                respondDBErr(err, res)
                respondMsg(res, 0, '存入用户信息成功')
            })
        }
    })
})

//更新用户信息
router.post('/saveUserInfo', (req, res) => {
    let obj = req.body;
    if(!verifyOpenID(obj.openID)) {
        respondMsg(res, 1, 'openID不合法');
        return;
    }
    if(!isNumber(obj.goal) || !isNumber(obj.daysOfPersistence)) {
        respondMsg(res, 1, '刷题目标或坚持天数不合法');
        return;
    }
    //是否存在此用户
    UserInfo.findOne({openID: obj.openID}, (err, resObj1) => {
        respondDBErr(err, res);
        if(!resObj1) {
            UserInfo.create({ openID: obj.openID, avatar: obj.avatar, nickname: obj.nickname, gender: obj.gender, school: obj.school, goal: obj.goal, motto: obj.motto, daysOfPersistence: obj.daysOfPersistence}, (err, resObj2) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '成功保存用户信息')
            })
        }
        else {
            UserInfo.updateOne({openID: obj.openID}, { avatar: obj.avatar, nickname: obj.nickname, 
                gender: obj.gender, school: obj.school, goal: obj.goal, motto: obj.motto, 
                daysOfPersistence: obj.daysOfPersistence}, (err, resObj2) => {
                respondDBErr(err, res);
                respondMsg(res, 0, '成功更新用户信息')
            })
        }
    })
})

// 获取用户信息
router.post('/getUserInfo', (req, res) => {
    let obj = req.body;
    UserInfo.findOne({openID: obj.openID}, (err, resObj) => {
        respondDBErr(err, res);
        if(resObj) {
            respondMsg(res, 0, '查询成功', { avatar: resObj.avatar, nickname: resObj.nickname, 
                gender: resObj.gender, school: resObj.school, goal: resObj.goal, 
                motto: resObj.motto, daysOfPersistence: resObj.daysOfPersistence});
        }
        //openID不存在
        else {
            respondMsg(res, 1, '用户不存在')
        }
    })
})

module.exports = router