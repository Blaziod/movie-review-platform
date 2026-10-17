const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const User = require('../models/User');
const AdminStatsFacade = require('../stats/AdminStatsFacade');
const { getAdminStats } = require('../controllers/adminController');
const app = require('../server');
const { expect } = chai;

chai.use(chaiHttp);

// US6.1 - As an admin, I want a statistics dashboard (GET /api/admin/stats).
describe('AdminController - getAdminStats', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('US6.1-AC1 an admin gets 200 with the dashboard statistics', async () => {
    const stats = {
      reviews: { pending: 3, approved: 10, rejected: 2, total: 15 },
      movies: { total: 7 },
      reviewers: { total: 4 },
      topRated: [
        { id: 'movie1', title: 'Inception', year: 2010, genre: 'Sci-Fi', avgRating: 4.8, reviewCount: 12 },
      ],
      generatedAt: '2026-10-17T00:00:00.000Z',
    };
    const req = { user: { id: 'admin1', role: 'admin' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(AdminStatsFacade.prototype, 'getDashboardStats').resolves(stats);

    await getAdminStats(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledOnceWithExactly(stats)).to.be.true;
  });

  it('US6.1-AC3 an empty database answers 200 with zeros and an empty topRated', async () => {
    const req = { user: { id: 'admin1', role: 'admin' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(Review, 'countDocuments').resolves(0);
    sinon.stub(Movie, 'countDocuments').resolves(0);
    sinon.stub(User, 'countDocuments').resolves(0);
    const chain = {
      sort: sinon.stub(),
      limit: sinon.stub(),
      select: sinon.stub(),
      lean: sinon.stub().resolves([]),
    };
    chain.sort.returns(chain);
    chain.limit.returns(chain);
    chain.select.returns(chain);
    sinon.stub(Movie, 'find').returns(chain);

    await getAdminStats(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    const body = res.json.firstCall.args[0];
    expect(body.reviews).to.deep.equal({ pending: 0, approved: 0, rejected: 0, total: 0 });
    expect(body.movies).to.deep.equal({ total: 0 });
    expect(body.reviewers).to.deep.equal({ total: 0 });
    expect(body.topRated).to.deep.equal([]);
    expect(body.generatedAt).to.be.a('string');
  });

  it('US6.1-AC4 a failure answers 500 with a generic message and logs the error', async () => {
    const req = { user: { id: 'admin1', role: 'admin' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(AdminStatsFacade.prototype, 'getDashboardStats').rejects(new Error('DB Error'));
    const consoleStub = sinon.stub(console, 'error');

    await getAdminStats(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledOnceWithExactly({ message: 'Could not load statistics' })).to.be.true;
    expect(consoleStub.calledWith('DB Error')).to.be.true;
  });
});

// US6.1-AC2 - Access control through the real app (protect + requireAdmin).
describe('GET /api/admin/stats - access control', () => {
  let setJwtSecret = false;

  before(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-secret';
      setJwtSecret = true;
    }
  });

  after(() => {
    if (setJwtSecret) {
      delete process.env.JWT_SECRET;
    }
  });

  afterEach(() => {
    sinon.restore();
  });

  const loginAs = (role) => {
    sinon.stub(jwt, 'verify').returns({ id: 'user123' });
    sinon.stub(User, 'findById').returns({
      select: sinon.stub().resolves({ id: 'user123', role }),
    });
  };

  it('US6.1-AC2 no token answers 401', async () => {
    const response = await chai.request(app).get('/api/admin/stats');

    expect(response).to.have.status(401);
  });

  it('US6.1-AC2 a reviewer token answers 403', async () => {
    loginAs('reviewer');
    const facadeStub = sinon.stub(AdminStatsFacade.prototype, 'getDashboardStats');

    const response = await chai
      .request(app)
      .get('/api/admin/stats')
      .set('Authorization', 'Bearer reviewer-token');

    expect(response).to.have.status(403);
    expect(facadeStub.called).to.be.false;
  });

  it('US6.1-AC2 an admin token answers 200 with JSON', async () => {
    loginAs('admin');
    const stats = {
      reviews: { pending: 0, approved: 1, rejected: 0, total: 1 },
      movies: { total: 1 },
      reviewers: { total: 1 },
      topRated: [],
      generatedAt: '2026-10-17T00:00:00.000Z',
    };
    sinon.stub(AdminStatsFacade.prototype, 'getDashboardStats').resolves(stats);

    const response = await chai
      .request(app)
      .get('/api/admin/stats')
      .set('Authorization', 'Bearer admin-token');

    expect(response).to.have.status(200);
    expect(response).to.be.json;
    expect(response.body).to.deep.equal(stats);
  });
});
