const router = require('express').Router();
const db = require('../db/connection');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const respondError422 = (res, next) => {
  res.status(422);
  next(new Error('Unable to login'));
};

const tokenSendResponse = async (user, res, next) => {
  //we create a payload for our token.i.e the user id and username
  const payload = {
    _id: user._id,
    username: user.username,
  };
  //create a token with jwt.sign using the payload and secret and set expiring time of token
  const token = await jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: '1d',
  });
  //we check if there is a problem on gerating token and return an error
  if (!token) return respondError422(res, next);
  //return token ato client
  return res.json({
    token,
  });
};

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

router.post('/signup', async (req, res, next) => {
  try {
    //validate req.body
    let user = await schema.validateAsync(req.body);
    //cehck is user exist in database
    const exist = await users.findOne({ username: req.body.username });
    if (exist) {
      //throw an error if user exist
      res.status(400);
      next(new Error('user aleady exist'));
    }
    console.log('hello');
    //hash the user password using bcrypt
    user.password = await bcrypt.hash(user.password, 12);
    //save the user to database
    user = await users.insert(user);
    //delete password from object sent to client

    tokenSendResponse(user, res, next);
  } catch (err) {
    res.status(422);
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  //validate client request
  const result = schema.validate(req.body);
  //check is user request is valid and return an error if not valid
  if (result.error) return respondError422(res, next);
  //check for user when user request is valid
  const user = await users.findOne({ username: req.body.username });
  //check if we found a user and return an error if not found
  if (!user) return respondError422(res, next);
  //we check if password sent by user matches whats in the database
  const match = await bcrypt.compare(req.body.password, user.password);
  //we check if we have a match or return an error if no match
  if (!match) return respondError422(res, next);

  tokenSendResponse(user, res, next);
});

module.exports = router;
