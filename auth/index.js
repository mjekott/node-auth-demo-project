const router = require('express').Router();
const db = require('../db/connection');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const users = db.get('users');
users.createIndex('username', { unique: true });

const schema = Joi.object({
  username: Joi.string()
    .trim()
    .regex(/(^[a-zA-Z0-9_]+$)/)
    .min(3)
    .max(30)
    .required(),
  password: Joi.string().trim().min(8).required(),
});

router.get('/', (req, res) => {
  res.json({
    message: 'hello',
  });
});

router.get('/signup', async (req, res, next) => {
  try {
    //validate req.body
    let user = await schema.validateAsync(req.body);
    //cehck is user exist in database
    const exist = await users.findOne({ username: req.body.username });
    if (exist) {
      //throw an error if user exist
      next(new Error('user aleady exist'));
    }
    //hash the user password using bcrypt
    user.password = await bcrypt.hash(user.password, 12);
    //save the user to database
    user = await users.insert(user);
    //delete password from object sent to client
    delete user.password;
    //return a response to the client
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
