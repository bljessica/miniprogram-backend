//使用Mocha作为测试运行器，Chai作为断言库，  chai-http 发出实际的HTTP请求
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

const server = require('../app')

chai.use(chaiHttp);

describe('Record', () => {
    it('should update a SINGLE record on /record/markFaulty POST');
    it('should update a SINGLE record on /record/markDone POST');
});

it('should update a SINGLE record on /record/markFaulty POST', function(done) {
    let record = {
        "openID": "177",
        "id": 5
    };
    chai.request(server)
    .post('/record/markFaulty')
    .send(record)
    .end(function(err, res){
        res.should.have.status(200);
        let result = JSON.parse(res.text);
        done();
    });
});


it('should update a SINGLE record on /record/markDone POST', function(done) {
    let record = {
        "openID": "177",
        "id": 7
    };
    chai.request(server)
    .post('/record/markDone')
    .send(record)
    .end(function(err, res){
        res.should.have.status(200);
        done();
    });
});
        
    