const chai = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { expect } = chai;

describe('authMiddleware - protect', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should attach req.user and call next() for a valid token', async () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const next = sinon.spy();

    sinon.stub(jwt, 'verify').returns({ id: 'user123' });
    sinon.stub(User, 'findById').returns({
      select: sinon.stub().resolves({ id: 'user123', role: 'reviewer' }),
    });

    await protect(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(req.user).to.deep.equal({ id: 'user123', role: 'reviewer' });
  });

  it('should return 401 when no Authorization header is present', async () => {
    const req = { headers: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const next = sinon.spy();

    await protect(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(next.called).to.be.false;
  });

  it('should return 401 for an invalid/expired token', async () => {
    const req = { headers: { authorization: 'Bearer bad-token' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const next = sinon.spy();

    sinon.stub(jwt, 'verify').throws(new Error('invalid signature'));

    await protect(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(next.called).to.be.false;
  });
});

describe('authMiddleware - requireAdmin', () => {
  it('should call next() when req.user.role is admin', () => {
    const req = { user: { role: 'admin' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const next = sinon.spy();

    requireAdmin(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
  });

  // US1.3 AC: a non-admin calling an admin route directly -> 403 Forbidden.
  it('should return 403 when req.user.role is reviewer', () => {
    const req = { user: { role: 'reviewer' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const next = sinon.spy();

    requireAdmin(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(next.called).to.be.false;
  });
});
