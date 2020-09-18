//使用Mocha作为测试运行器，Chai作为断言库，  chai-http 发出实际的HTTP请求
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

const server = require('../app')

chai.use(chaiHttp);

describe('Notice', () => {
    it('should list the notice on /notice/getNotice GET');
    it('should update the otice on /notice/saveNotice POST');
});

it('should list the notice on /notice/getNotice GET', function(done) {
    chai.request(server)
    .get('/notice/getNotice')
    .end(function(err, res){
        res.should.have.status(200);
        let result = JSON.parse(res.text);
        if(result.code == 0){
            result.data.should.have.property("content");
        }
        done();
    });
});

it('should update the otice on /notice/saveNotice POST', function(done) {
    let notice = {
        "content": "这是通告栏~"
    };
    chai.request(server)
    .post('/notice/saveNotice')
    .send(notice)
    .end(function(err, res){
        res.should.have.status(200);
        done();
    });
});
        
    