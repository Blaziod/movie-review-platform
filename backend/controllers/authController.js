const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

    // role is always 'reviewer' here because there is no public admin sign-up.
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
    // second insert with a raw Mongo duplicate-key error (E11000) catch
    // that specifically and return the same clean message as the findOne
    // check above, instead of a confusing 500.
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: error.message });
  }
};

// As a registered user, I want to log in, so I reach my role's dashboard.
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are both required.' });
  }

  try {
    const user = await User.findOne({ email });

    // AC: wrong credentials -> "Invalid email or password". Deliberately the
    // same message whether the email doesn't exist or the password is wrong.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
