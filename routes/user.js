const express = require('express');
const router = express.Router();//可使用 express.Router 类创建模块化、可挂载的路由句柄
const moment = require('moment');
const md5 = require('md5')
const axios = require('axios');

const { UserInfo, Record } = require('../util/dbcon');
const { respondMsg } = require('../util/response');
const { verifyOpenID, verifyGender, isNumber } = require('../util/verifyData');
const { saveDaysOfPersistence } = require('../util/processData');

const PASSWORD = 'jessi.club';//在原来的字符串的基础上加上一些特殊文本再进行md5加密

//获取用户昵称
router.post('/getUser', (req, res) => {
    let obj = req.body;
    UserInfo.findOne({openID: obj.openID}, (err, resObj) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        //存在此openID
        if(resObj) {
            let date = moment();
            //剩余天数
            let daysOfPersistence = date.diff(moment(resObj.createTime).format('YYYY-MM-DD'), 'days') + 1;
            // console.log(date.diff(moment(resObj.createTime).format('YYYY-MM-DD'), 'days'), date.format('YYYY-MM-DD'), moment(resObj.createTime).format('YYYY-MM-DD'))
            // console.log((Date.now() - moment(resObj.createTime).valueOf()) / (1*24*60*60*1000))
            //存储剩余天数
            saveDaysOfPersistence(res, obj, daysOfPersistence)
                .then(() => {
                    let daysRemaining = -1;
                    if(resObj.goal) {
                        daysRemaining = resObj.goal - daysOfPersistence;
                    }
                    //用户个人正确率
                    //用户做过的题数
                    UserInfo.findOne({openID: obj.openID}, (err, user) => {
                        if(err) {
                            respondMsg(res, 1, '数据库操作失败');
                            return;
                        }
                        respondMsg(res, 0, '查询成功', {
                            nickname: resObj.nickname,
                            avatar: resObj.avatar,
                            daysRemaining: daysRemaining,
                            daysOfPersistence: daysOfPersistence,
                            correctRate: user.doneQuesNum == 0 ? 0: parseInt((user.doneQuesNum - user.wrongQuesNum) / user.doneQuesNum * 100)
                        })
                    })
                })
        }
        //openID不存在
        else {
            respondMsg(res, 1, '用户不存在');
            return;
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
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        //存过
        if(resObj1) {
            UserInfo.updateOne({ openID: obj.openID}, {avatar: obj.avatar, gender: obj.gender, 
                nickname: obj.nickname}, (err, resObj2) => {
                if(err) {
                    respondMsg(res, 1, '数据库操作失败');
                    return;
                }
                respondMsg(res, 0, '更新用户信息成功')
                return;
            })
        }
        //没存过
        else {
            UserInfo.create({ openID: obj.openID, avatar: obj.avatar, gender: obj.gender, nickname: obj.nickname}, (err, resObj2) => {
                if(err) {
                    respondMsg(res, 1, '数据库操作失败');
                    return;
                }
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
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        if(!resObj1) {
            UserInfo.create({ openID: obj.openID, avatar: obj.avatar, nickname: obj.nickname, gender: obj.gender, school: obj.school, goal: obj.goal, motto: obj.motto, daysOfPersistence: obj.daysOfPersistence}, (err, resObj2) => {
                if(err) {
                    respondMsg(res, 1, '数据库操作失败');
                    return;
                }
                respondMsg(res, 0, '成功保存用户信息')
            })
        }
        else {
            //更新剩余天数
            let date = moment();
            let daysOfPersistence = date.diff(moment(resObj1.createTime).format('YYYY-MM-DD'), 'days') + 1;
            UserInfo.updateOne({openID: obj.openID}, { avatar: obj.avatar, nickname: obj.nickname, 
                gender: obj.gender, school: obj.school, goal: obj.goal, motto: obj.motto, 
                daysOfPersistence: daysOfPersistence}, (err, resObj2) => {
                if(err) {
                    respondMsg(res, 1, '数据库操作失败');
                    return;
                }
                respondMsg(res, 0, '成功更新用户信息')
            })
        }
    })
})

// 获取用户信息
router.post('/getUserInfo', (req, res) => {
    let obj = req.body;
    UserInfo.findOne({openID: obj.openID}, (err, resObj) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        if(resObj) {
            respondMsg(res, 0, '查询成功', { 
                avatar: resObj.avatar, 
                nickname: resObj.nickname, 
                gender: resObj.gender, 
                school: resObj.school, 
                goal: resObj.goal, 
                motto: resObj.motto, 
                isAdmin: resObj.isAdmin,
                daysOfPersistence: resObj.daysOfPersistence});
        }
        //openID不存在
        else {
            respondMsg(res, 1, '用户不存在')
        }
    })
})

//刷题数量最多的20名用户
router.post('/getNumRank', (req, res) => {
    let obj = req.body;
    UserInfo.find({}, (err, usersDoneNum) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        let doneUserArr = [];
        usersDoneNum.forEach(item => {
            doneUserArr.push({
                nickname: item.nickname,
                avatar: item.avatar,
                doneQuesNum: item.doneQuesNum
            })
        })
        UserInfo.findOne({openID: obj.openID}, (err, resObj) => {
            if(err) {
                respondMsg(res, 1, '数据库操作失败');
                return;
            }
            respondMsg(res, 0, '查询成功', {
                rankNum: doneUserArr,
                mine: {
                    doneQuesNum: resObj.doneQuesNum
                }
            });
        })
    }).sort({doneQuesNum: -1}).limit(20);
})

//坚持天数最多的20名用户
router.post('/getDaysRank', (req, res) => {
    let obj = req.body;
    UserInfo.find({}, (err, usersDays) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        let daysUserArr = [];
        usersDays.forEach(item => {
            daysUserArr.push({
                nickname: item.nickname,
                avatar: item.avatar,
                daysOfPersistence: item.daysOfPersistence
            })
        })
        UserInfo.findOne({openID: obj.openID}, (err, resObj) => {
            if(err) {
                respondMsg(res, 1, '数据库操作失败');
                return;
            }
            respondMsg(res, 0, '查询成功', {
                rankDays: daysUserArr,
                mine: {
                    daysOfPersistence: resObj.daysOfPersistence
                }
            });
        })
    }).sort({daysOfPersistence: -1}).limit(20);
})

//(未使用)刷题数量最多和坚持天数最多的20名用户
router.post('/getRank', (req, res) => {
    let obj = req.body;
    UserInfo.find({}, (err, usersDoneNum) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        let doneUserArr = [];
        usersDoneNum.forEach(item => {
            doneUserArr.push({
                nickname: item.nickname,
                avatar: item.avatar,
                doneQuesNum: item.doneQuesNum
            })
        })
        UserInfo.find({}, (err, usersDays) => {
            if(err) {
                respondMsg(res, 1, '数据库操作失败');
                return;
            }
            let daysUserArr = [];
            usersDays.forEach(item => {
                daysUserArr.push({
                    nickname: item.nickname,
                    avatar: item.avatar,
                    daysOfPersistence: item.daysOfPersistence
                })
            })
            UserInfo.findOne({openID: obj.openID}, (err, resObj) => {
                if(err) {
                    respondMsg(res, 1, '数据库操作失败');
                    return;
                }
                respondMsg(res, 0, '查询成功', {
                    rankNum: usersDoneNum,
                    rankDays: usersDays,
                    mine: {
                        doneQuesNum: resObj.doneQuesNum,
                        daysOfPersistence: resObj.daysOfPersistence
                    }
                });
            })
        }).sort({daysOfPersistence: -1}).limit(20);
    }).sort({doneQuesNum: -1}).limit(20);
})

//根据临时code获取openID
router.post('/getOpenID', (req, res) => {
    let code = req.body.code;
    axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=wx0e8cbbba3aab1125&secret=9097a462abccba0564091d8536fc7295&js_code=${code}&grant_type=authorization_code`)
        .then(response => {
            respondMsg(res, 0, '查询成功', {
                openID: md5(response.data.openid + PASSWORD)
            })
        })
        .catch(err => {
            respondMsg(res, 1, '操作失败', err)
        })
})

module.exports = router