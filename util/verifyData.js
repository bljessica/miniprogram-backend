const { Question } = require('../util/dbcon');


//openID是否合法
function verifyOpenID(openID) {
    if(openID == null || openID == '' || openID == undefined) {
        return false;
    }
    return true;
}

//性别输入是否合法
function verifyGender(gender) {
    if(gender != 1 && gender != 2) {
        return false;
    }
    return true;
}

//输入是否为数字
function isNumber(data) {
    if(data == null) return true;
    if(!/^[0-9]*$/.test(data)) {
        return false;
    }
    return true;
}

//科目输入是否合法
function verifySubject(subject) {
    if([1, 2, 3, 4].includes(parseInt(subject))) {
        return true;
    }
    return false;
}


//类型输入是否合法
function verifyType(type) {
    if([1, 2].includes(parseInt(type))) {
        return true;
    }
    return false;
}

function questionTotalNum(res) {
    return new Promise((resolve, reject) => {
        Question.find({}, (err, resObj) => {
            resolve(resObj[0].id);
        }).sort({id: -1}).skip(0).limit(1);
    }) 
}

function verifyQuestionID(res, id) {
    if(!isNumber(id)){
        console.log(11111)
        return false;
    }
    return questionTotalNum(res, id)
        .then((maxID) => {
            if(id <= maxID && id > 0) {
                return true;
            }
            else {
                return false;
            }
        })
}


module.exports.verifyOpenID = verifyOpenID;
module.exports.verifyGender = verifyGender;
module.exports.isNumber = isNumber;
module.exports.verifySubject = verifySubject;
module.exports.verifyType = verifyType;
module.exports.verifyQuestionID = verifyQuestionID;
