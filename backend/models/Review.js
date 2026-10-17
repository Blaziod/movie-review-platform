const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    moderationReason: { type: String, default: '' },
    // Review ranking: who marked this review helpful, and the running total. 
    helpfulVoters: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [], select: false },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// NFR (performance): one compound index per sort order, so listing a movie's
// approved reviews in any order is an index scan rather than an in-memory sort.
reviewSchema.index({ movieId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ movieId: 1, status: 1, rating: -1, createdAt: -1 });
reviewSchema.index({ movieId: 1, status: 1, helpfulCount: -1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
