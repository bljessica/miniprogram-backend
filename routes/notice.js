const express = require('express');
const router = express.Router();//可使用 express.Router 类创建模块化、可挂载的路由句柄
const { Notice } = require('../util/dbcon');
const { respondMsg } = require('../util/response');

//获取公告栏内容
router.get('/getNotice', (req, res) => {
    Notice.findOne({}, (err, resObj) => {
        if(err){
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        if(!resObj) {
            respondMsg(res, 1, '暂无通知');
            return;
        }
        else {
            respondMsg(res, 0, '查询成功', {
                content: resObj.content
            });
        }
    })
})

//修改公告栏内容
router.post('/saveNotice', (req, res) => {
    let obj = req.body;
    Notice.findOne({}, (err, resObj1) => {
        if(err){
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        if(!resObj1){
            Notice.create({content: obj.content}, (err, resObj2) => {
                if(err){
                    respondMsg(res, 1, '数据库操作失败');
                    return;
                }
                respondMsg(res, 0, '保存成功');
                return;
            })
        }
        else {
            Notice.updateOne({}, {content: obj.content}, (err, resObj2) => {
                if(err){
                    respondMsg(res, 1, '数据库操作失败');
                    return;
                }
                respondMsg(res, 0, '修改成功');
                return;
            })
        }
    })
})

module.exports = router;