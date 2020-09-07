const { SUBJECTS } = require('./const');

const subjects = require('./const').SUBJECTS;
const types = require('./const').TYPES;


function processSubject(num) {
    //输入错误
    if(num != 1 && num != 2 && num != 3 && num != 4) {
        return null;
    }
    return subjects[num - 1];
}

function processType(num) {
    //输入错误
    if(num != 1 && num != 2) {
        return null;
    }
    return types[num - 1];
}

function verifyOpenID(openID) {
    if(openID == null || openID == '' || openID == undefined) {
        return false;
    }
    return true;
}

function verifyGender(gender) {
    if(gender != 1 && gender != 2) {
        return false;
    }
    return true;
}

function isNumber(data) {
    if(data == null) return true;
    if(!/^[0-9]*$/.test(data)) {
        return false;
    }
    return true;
}

module.exports.processSubject = processSubject;
module.exports.processType = processType;
module.exports.verifyOpenID = verifyOpenID;
module.exports.verifyGender = verifyGender;
module.exports.isNumber = isNumber;
