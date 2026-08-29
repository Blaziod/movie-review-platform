const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// As a visitor, I want to register as a Reviewer, so that I can submit reviews.
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are all required.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // role is always 'reviewer' here because there is no public admin sign-up (US1.3).
    const user = await User.create({ name, email, password, role: 'reviewer' });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    // Self-review fix: findOne + create isn't atomic, so a duplicate email
    // submitted twice in quick succession can both pass the findOne check
    // and race to create(). The schema's unique index then rejects the
    // second insert with a raw Mongo duplicate-key error (E11000) - catch
    // that specifically and return the same clean message as the findOne
    // check above, instead of a confusing 500.
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser };
