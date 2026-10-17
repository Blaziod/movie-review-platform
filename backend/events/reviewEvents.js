const { EventEmitter } = require('events');

// Observer pattern: this emitter is the subject. The review controller announces
// that a review was moderated; 
const REVIEW_MODERATED = 'review.moderated';

const reviewEvents = new EventEmitter();

module.exports = { reviewEvents, REVIEW_MODERATED };
