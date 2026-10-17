const express = require('express');
const { getAdminStats } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/stats', protect, requireAdmin, getAdminStats);

module.exports = router;
