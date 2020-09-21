const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');
const http = require('http');
const https = require('https');

const app = express();

//配置https证书
const credentials = {
    key: fs.readFileSync('./https/2_www.jessi.club.key'),
    cert: fs.readFileSync('./https/1_www.jessi.club_bundle.crt')
}

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
let PORT = 3000;
let SSLPORT = 8000;

const user = require('./routes/user')
const getQuestion = require('./routes/getQuestion')
const record = require('./routes/record')
const note = require('./routes/note')
const notice = require('./routes/notice')
const admin = require('./routes/admin')

// app.use(express.static('public'))
app.use(bodyParser.json({limit: '50mb'}));//解析json数据格式
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));//解析form表单字段(Content-Type: application/x-www-form-urlencoded)

//挂载路由
app.use('/user/', user)
app.use('/ques/', getQuestion)
app.use('/record/', record)
app.use('/note/', note)
app.use('/notice/', notice)
app.use('/admin/', admin)

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log('HTTP SERVER is running on: http://49.234.89.20:%s', PORT);
})

httpsServer.listen(SSLPORT, '0.0.0.0', () => {
    console.log('HTTPS SERVER is running on: https://49.234.89.20:%s', SSLPORT);
})

app.get('/', function(req, res) {
    if(req.protocol === 'https') {
        res.status(200).send('Welcome to Safety Land!');
    }
    else {
        res.status(200).send('Welcome!');
    }
});

// //mocha测试
// module.exports = httpServer.listen(PORT, '0.0.0.0', () => {
//     console.log('HTTP SERVER is running on: http://49.234.89.20:%s', PORT);
// })


