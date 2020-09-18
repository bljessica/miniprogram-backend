//使用Mocha作为测试运行器，Chai作为断言库，  chai-http 发出实际的HTTP请求
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

const server = require('../app')

chai.use(chaiHttp);

describe('Userinfo', () => {
    it('should list a SINGLE userinfo on /user/getUserInfo POST');
    it('should update a SINGLE userinfo on /user/saveUserInfo POST');
});

it('should list a SINGLE userinfo on /user/getUserInfo POST', function(done) {
    let userinfo = {
        "openID": "177"
    };
    chai.request(server)
    .post('/user/getUserInfo')
    .send(userinfo)
    .end(function(err, res){
        res.should.have.status(200);
        let result = JSON.parse(res.text);
        if(result.code == 1){
            result.data.should.have.property("avatar");
            result.data.should.have.property("daysOfPersistence");
        }
        
        done();
    });
});


it('should update a SINGLE userinfo on /user/saveUserInfo POST', function(done) {
    let userinfo = {
        "openID": "177",
        "nickname": "mike"
    };
    chai.request(server)
    .post('/user/saveUserInfo')
    .send(userinfo)
    .end(function(err, res){
        res.should.have.status(200);
        done();
    });
});
        
    