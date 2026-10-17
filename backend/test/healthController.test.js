const chai = require('chai');
const sinon = require('sinon');
const dbStatus = require('../utils/dbStatus');
const { getHealth } = require('../controllers/healthController');
const { expect } = chai;

describe('healthController - getHealth', () => {
  let savedInstanceName;

  beforeEach(() => {
    savedInstanceName = process.env.INSTANCE_NAME;
  });

  afterEach(() => {
    sinon.restore();
    if (savedInstanceName === undefined) {
      delete process.env.INSTANCE_NAME;
    } else {
      process.env.INSTANCE_NAME = savedInstanceName;
    }
  });

  it('HEALTH-AC1 answers 200 with status ok and the instance name when MongoDB is connected', () => {
    process.env.INSTANCE_NAME = 'server1';
    const req = {};
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(dbStatus, 'isDatabaseConnected').returns(true);

    getHealth(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    const body = res.json.firstCall.args[0];
    expect(body).to.have.all.keys('status', 'instance', 'database', 'timestamp');
    expect(body).to.include({ status: 'ok', instance: 'server1', database: 'connected' });
    expect(Number.isNaN(Date.parse(body.timestamp))).to.be.false;
  });

  it('HEALTH-AC2 answers 503 with status unavailable when MongoDB is disconnected', () => {
    process.env.INSTANCE_NAME = 'server2';
    const req = {};
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(dbStatus, 'isDatabaseConnected').returns(false);

    getHealth(req, res);

    expect(res.status.calledWith(503)).to.be.true;
    const body = res.json.firstCall.args[0];
    expect(body).to.have.all.keys('status', 'instance', 'database', 'timestamp');
    expect(body).to.include({ status: 'unavailable', instance: 'server2', database: 'disconnected' });
  });

  it("HEALTH-AC3 reports instance 'local' when INSTANCE_NAME is not set", () => {
    delete process.env.INSTANCE_NAME;
    const req = {};
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(dbStatus, 'isDatabaseConnected').returns(true);

    getHealth(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.firstCall.args[0].instance).to.equal('local');
  });
});
