const express = require("express");
const router = express.Router();
const Question = require('../models/question')

router.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    console.error('Error retrieving questions:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;