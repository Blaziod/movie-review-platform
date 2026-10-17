const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { expect } = chai;

const makeRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });

describe('NotificationController - getMyNotifications', () => {
  afterEach(() => sinon.restore());

  it('returns the user\'s notifications newest first with the unread count', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const items = [{ message: 'b' }, { message: 'a' }];
    const query = { sort: sinon.stub().returnsThis(), limit: sinon.stub().resolves(items) };
    const findStub = sinon.stub(Notification, 'find').returns(query);
    const countStub = sinon.stub(Notification, 'countDocuments').resolves(1);
    const res = makeRes();

    await getMyNotifications({ user: { id: userId } }, res);

    expect(findStub.calledWith({ userId })).to.be.true;
    expect(query.sort.calledWith({ createdAt: -1 })).to.be.true;
    expect(countStub.calledWith({ userId, read: false })).to.be.true;
    expect(res.json.calledWith({ notifications: items, unreadCount: 1 })).to.be.true;
  });

  it('returns 500 when the database fails', async () => {
    sinon.stub(Notification, 'find').throws(new Error('DB Error'));
    const res = makeRes();

    await getMyNotifications({ user: { id: 'u1' } }, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('NotificationController - markAsRead', () => {
  afterEach(() => sinon.restore());

  it('marks the owner\'s notification as read', async () => {
    const userId = new mongoose.Types.ObjectId();
    const notification = { userId, read: false, save: sinon.stub() };
    notification.save.resolves(notification);
    sinon.stub(Notification, 'findById').resolves(notification);
    const res = makeRes();

    await markAsRead({ params: { id: 'n1' }, user: { id: userId.toString() } }, res);

    expect(notification.read).to.be.true;
    expect(res.json.calledWith(notification)).to.be.true;
  });

  it('returns 404 when the notification does not exist', async () => {
    sinon.stub(Notification, 'findById').resolves(null);
    const res = makeRes();

    await markAsRead({ params: { id: 'missing' }, user: { id: 'u1' } }, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it('returns 403 when the notification belongs to someone else', async () => {
    const notification = { userId: new mongoose.Types.ObjectId(), read: false, save: sinon.stub() };
    sinon.stub(Notification, 'findById').resolves(notification);
    const res = makeRes();

    await markAsRead({ params: { id: 'n1' }, user: { id: new mongoose.Types.ObjectId().toString() } }, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(notification.save.called).to.be.false;
  });
});

describe('NotificationController - markAllAsRead', () => {
  afterEach(() => sinon.restore());

  it('marks only the user\'s unread notifications as read', async () => {
    const updateStub = sinon.stub(Notification, 'updateMany').resolves();
    const res = makeRes();

    await markAllAsRead({ user: { id: 'u1' } }, res);

    expect(updateStub.calledWith({ userId: 'u1', read: false }, { read: true })).to.be.true;
    expect(res.json.calledWithMatch({ message: 'All notifications marked as read' })).to.be.true;
  });
});
