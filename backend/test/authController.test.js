const chai = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { registerUser, loginUser } = require('../controllers/authController');
const { expect } = chai;

//As a visitor, I want to register as a Reviewer, so that I can submit reviews.
describe('AuthController - registerUser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should create a new reviewer account and return a token', async () => {
    const req = {
      body: { name: 'Jane Reviewer', email: 'jane@example.com', password: 'password123' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(User, 'create').resolves({
      id: 'abc123',
      name: 'Jane Reviewer',
      email: 'jane@example.com',
      role: 'reviewer',
    });
    sinon.stub(jwt, 'sign').returns('fake-jwt-token');

    await registerUser(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(
      res.json.calledWithMatch({
        name: 'Jane Reviewer',
        email: 'jane@example.com',
        role: 'reviewer',
        token: 'fake-jwt-token',
      })
    ).to.be.true;
  });

  it('should return 400 and not create a duplicate when the email already exists', async () => {
    const req = {
      body: { name: 'Jane Reviewer', email: 'jane@example.com', password: 'password123' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(User, 'findOne').resolves({ id: 'existing-user', email: 'jane@example.com' });
    const createStub = sinon.stub(User, 'create');

    await registerUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Email already in use' })).to.be.true;
    expect(createStub.called).to.be.false;
  });

  it('should return 400 when required fields are missing', async () => {
    const req = { body: { email: 'jane@example.com' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await registerUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
  });

  // Self-review: findOne + create is not atomic, so two near-simultaneous
  // registrations for the same email can both pass the findOne check and
  // race to create(). The unique index then rejects the second insert with
  // a Mongo duplicate-key error (E11000) - this should surface as the same
  // clean 400 message, not a raw 500.
  it('should return 400 (not 500) when create() fails with a duplicate-key error', async () => {
    const req = {
      body: { name: 'Jane Reviewer', email: 'jane@example.com', password: 'password123' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(User, 'findOne').resolves(null);
    const duplicateKeyError = new Error('E11000 duplicate key error');
    duplicateKeyError.code = 11000;
    sinon.stub(User, 'create').rejects(duplicateKeyError);

    await registerUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Email already in use' })).to.be.true;
  });
});

// As a registered user, I want to log in, so I reach my role's dashboard.
describe('AuthController - loginUser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should log in with correct credentials and return a token', async () => {
    const req = { body: { email: 'jane@example.com', password: 'password123' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(User, 'findOne').resolves({
      id: 'abc123',
      name: 'Jane Reviewer',
      email: 'jane@example.com',
      role: 'reviewer',
      password: 'hashed-password',
    });
    sinon.stub(bcrypt, 'compare').resolves(true);
    sinon.stub(jwt, 'sign').returns('fake-jwt-token');

    await loginUser(req, res);

    expect(res.json.calledWithMatch({ role: 'reviewer', token: 'fake-jwt-token' })).to.be.true;
    expect(res.status.called).to.be.false; 
  });

  it('should return 401 for a wrong password', async () => {
    const req = { body: { email: 'jane@example.com', password: 'wrongpassword' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(User, 'findOne').resolves({ email: 'jane@example.com', password: 'hashed-password' });
    sinon.stub(bcrypt, 'compare').resolves(false);

    await loginUser(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Invalid email or password' })).to.be.true;
  });

  it('should return 401 (same message) for an email that does not exist', async () => {
    const req = { body: { email: 'nobody@example.com', password: 'password123' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(User, 'findOne').resolves(null);

    await loginUser(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Invalid email or password' })).to.be.true;
  });

  it('should return 400 when email or password is missing', async () => {
    const req = { body: { email: 'jane@example.com' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await loginUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
  });
});
