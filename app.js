const express = require('express');
const bodyParser = require('body-parser')

const user = require('./routes/user')
const getQuestions = require('./routes/getQuestions')
const records = require('./routes/records')
const notes = require('./routes/notes')
const notice = require('./routes/notice')

const app = express();
// app.use(express.static('public'))
app.use(bodyParser.json());//解析json数据格式
app.use(bodyParser.urlencoded({extended: false}));//解析form表单字段(Content-Type: application/x-www-form-urlencoded)

//挂载路由
app.use('/user/', user)
app.use('/ques/', getQuestions)
app.use('/record/', records)
app.use('/note/', notes)
app.use('/notice/', notice)


const server = app.listen(3000, '0.0.0.0', () => {
    let host = server.address().address
    let port = server.address().port
    console.log('服务器运行在http://%s:%s', host, port)
})

