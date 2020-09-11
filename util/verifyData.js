const { Question } = require('../util/dbcon');
const {TYPE_VALUES, SUBJECT_VALUES, GENDER_VALUES} =  require('./const')
const { questionTotalNum } = require('./processData')

//openID是否合法
function verifyOpenID(openID) {
    if(openID == null || openID == '' || openID == undefined) {
        return false;
    }
    return true;
}

//性别输入是否合法
function verifyGender(gender) {
    if(GENDER_VALUES.includes(gender)) {
        return true;
    }
    return false;
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
    if(SUBJECT_VALUES.includes(parseInt(subject))) {
        return true;
    }
    return false;
}

//类型输入是否合法
function verifyType(type) {
    if(TYPE_VALUES.includes(parseInt(type))) {
        return true;
    }
    return false;
}


function verifyQuestionID(res, id) {
    if(!isNumber(id)){
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
// module.exports.questionTotalNum = questionTotalNum;
