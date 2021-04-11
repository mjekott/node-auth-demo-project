import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'hello',
  });
});

router.get('/signup', (req, res) => {
  res.json({
    message: 'router is back',
  });
});

module.exports = router;
