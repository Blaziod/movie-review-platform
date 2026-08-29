const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Temporary route purely to exercise the role-gating middleware end-to-end

router.get('/admin-check', protect, requireAdmin, (req, res) => {
  res.json({ message: 'Admin access confirmed', user: req.user });
});

module.exports = router;
