const express = require('express');
const router = express.Router();

const { UserInfo } = require('../util/dbcon');
const { respondMsg } = require('../util/response');


router.post('/isAdmin', (req, res) => {
    let obj = req.body;
    UserInfo.findOne({openID:obj.openID}, (err, resObj) => {
        if(err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
        }
        if(!resObj) {
            respondMsg(res, 1, '此用户不存在');
            return;
        }
        respondMsg(res, 0, '查询成功', {
            isAdmin: resObj.isAdmin
        });
    })
})


module.exports = router;
