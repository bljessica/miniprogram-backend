
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
    if([1, 2, 3, 4].includes(subject)) {
        return true;
    }
    return false;
}

//类型输入是否合法
function verifyType(type) {
    if([1, 2].includes(type)) {
        return true;
    }
    return false;
}


module.exports.verifyOpenID = verifyOpenID;
module.exports.verifyGender = verifyGender;
module.exports.isNumber = isNumber;
module.exports.verifySubject = verifySubject;
module.exports.verifyType = verifyType;
