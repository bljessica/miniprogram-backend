const { SUBJECTS, TYPES } = require('./const');
const { respondDBErr } = require('../util/response');
const { Record } = require('../util/dbcon')


function subjectToNumber(subject) {
    for(let i  = 0; i < SUBJECTS.length; i++) {
        if(subject == SUBJECTS[i]) {
            return i + 1;
        }
    }
    return -1;
}

function typeToNumber(type) {
    for(let i  = 0; i < TYPES.length; i++) {
        if(type == TYPES[i]) {
            return i + 1;
        }
    }
    return -1;
}

function sortByChapter(data) {
    return new Promise((resolve, reject) => {
        data.sort((a, b) => {
            return a.chapterNumber - b.chapterNumber;
        });
        resolve();
        console.log('排序成功');
    })
}

function countWrongRecords(obj, res) {
    return new Promise((resolve, reject) => {
        Record.countDocuments({openID: obj.openID, isWrong: true}, (err, count) => {
            respondDBErr(err, res);
            resolve(count);
        })
    })
}


module.exports.subjectToNumber = subjectToNumber;
module.exports.typeToNumber = typeToNumber;
module.exports.sortByChapter = sortByChapter;
module.exports.countWrongRecords = countWrongRecords;

