const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../node/server');

chai.use(chaiHttp);

describe('POST /login', () => {

  it('should login successfully with valid credentials', (done) => {
    chai.request(app)
      .post('/login')
      .type('form')
      .send({ email: 'test@example.com', password: 'validpassword' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should not login with incorrect email', (done) => {
    chai.request(app)
      .post('/login')
      .type('form')
      .send({ email: 'wrong@example.com', password: 'validpassword' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should not login with as user is banned', (done) => {
    chai.request(app)
      .post('/login')
      .type('form')
      .send({ email: 'test2@example.com', password: 'validpassword' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

});
