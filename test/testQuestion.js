//使用Mocha作为测试运行器，Chai作为断言库，  chai-http 发出实际的HTTP请求
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

const server = require('../app')

chai.use(chaiHttp);

describe('Question', () => {
    it('should list ALL questions on /ques/questions GET');
    it('should list a SINGLE question on /ques/question/id GET');
    it('should add a SINGLE question on /ques/createOneQuestion POST');
});

it('should list ALL questions on /ques/questions GET', function(done) {
    chai.request(server)
    .get('/ques/questions')
    .end(function(err, res){
        res.should.have.status(200);
        let result = JSON.parse(res.text);
        result.data.should.be.a('array');
        done();
    });
});

it('should list a SINGLE question on /ques/question/id GET', function(done) {
    chai.request(server)
    .get('/ques/questions/id?id=3')
    .end(function(err, res){
        res.should.have.status(200);
        let result = JSON.parse(res.text);
        result.data.should.be.a('object');
        result.data.should.have.property('subject');
        result.data.should.have.property('chapter');
        done();
    });
});

it('should add a SINGLE question on /ques/createOneQuestion POST', function(done) {
    let question = {
        "subject": 1,
        "chapterNumber": 1,
        "chapter": "马克思主义是关于无产阶级和人类解放的科学",
        "type":1,
        "question": "正义者同盟是什么",
        "A": "第一国际",
        "B": "政党",
        "C": "组织",
        "D": "第二国际",
        "answer": "C",
        "tip": "正义者同盟是组织，共产主义者同盟是政党"
    };
    chai.request(server)
    .post('/ques/createOneQuestion')
    .send(question)
    .end(function(err, res){
        res.should.have.status(200);
        done();
    });
});
        
    