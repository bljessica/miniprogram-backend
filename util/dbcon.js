const mongoose = require('mongoose')

// const url = 'mongodb://127.0.0.1:28018/ques'
const url = 'mongodb://127.0.0.1/ques'
const {TYPE_VALUES, SUBJECT_VALUES, GENDER_VALUES} =  require('../util/const')


//创建集合
function createSet(dbase, setName) {
    dbase.createCollection(setName, (err, res) => {
        if(err) {
            console.log('创建集合失败')
            return;
        }
        console.log('创建集合成功')
        dbase.close();
    })
}

mongoose.set('useCreateIndex', true);
mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => console.log('数据库连接成功'))
    .catch((err) => console.log('数据库连接失败'))

const db = mongoose.connection;

//集合规则
const questionSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    wrongNum: {
        type: Number,
        default: 0
    },
    doneNum: {
        type: Number,
        default: 0
    },
    subject: {
        type: Number,
        required: true,
        enum: SUBJECT_VALUES
    },
    chapterNumber: {
        type: Number,
        required: true
    },
    chapter: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true,
        enum: TYPE_VALUES
    },
    quesNumber: {
        type: Number,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    A: {
        type: String,
        required: true
    },
    B: {
        type: String,
        required: true
    },
    C: {
        type: String,
        required: true
    }, 
    D: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    tip: {
        type: String
    }
})
const userInfoSchema = new mongoose.Schema({
    openID: {
        type: String,
        unique: true
    },
    avatar: String,
    nickname: {
        type: String,
        required: true,
    },
    gender: {
        type: Number,
        enum: GENDER_VALUES
    },
    school: String,
    goal: Number,
    motto: String,
    daysOfPersistence: {
        type: Number,
        default: 0
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    wrongQuesNum: {
        type: Number,
        default: 0
    },
    doneQuesNum: {
        type: Number,
        default: 0 
    },
})
const recordSchema = new mongoose.Schema({
    openID: {
        type: String,
        required: true,
    },
    quesID: {
        type: Number,
        required: true,
    },
    note: String,
    noteCreatedTime: {
        type: Date,
        default: Date.now
    },
    isWrong: {
        type: Boolean,
        default: false
    },
    isCollected: {
        type: Boolean,
        default: false
    },
    collectedTime: {
        type: Date,
        default: Date.now
    }
})
const noticeSchema = new mongoose.Schema({
    content: String
})

//创建集合并应用规则
exports.Question = mongoose.model('Question', questionSchema);
exports.UserInfo = mongoose.model('Userinfo', userInfoSchema);
exports.Record = mongoose.model('Record', recordSchema);
exports.Notice = mongoose.model('Notice', noticeSchema);

