const express = require('express');
const router = express.Router();
const multer = require('multer');
const Question = require('../models/question');
const WordExtractor = require('word-extractor');

const extractor = new WordExtractor();

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/api/upload', upload.single('file'), async function (req, res) {
  try {
    const docxBuffer = req.file.buffer;
    const extracted = extractor.extract(docxBuffer);

    extracted.then(async (docx) => {
      const text = docx.getBody();
      const questionsData = text.split(/\n\n/); // Adjust the splitting logic

      console.log(questionsData);
      console.log(questionsData.length);

      for (let index = 0; index < questionsData.length; index++) {
        const questionData = questionsData[index].trim();

        if (!questionData) {
          continue;
        }

        // Use regular expressions to extract question and options
        const questionMatch = questionData.match(/Q\d+\.\s*([\s\S]*?)(\n|$)/);
        const optionsMatches = questionData.match(/[A-D]\)\s*([\s\S]*?)(?=\n[A-D]|\nAnswer:|$)/g);
        const correctAnswerMatch = questionData.match(/Answer:\s*([A-D]\))/);

        if (questionMatch && optionsMatches && correctAnswerMatch) {
          const questionText = questionMatch[1].trim();
          const options = optionsMatches.map((match) => match.trim());
          const correctAnswer = correctAnswerMatch[1].trim();

          const newQuestion = new Question({
            question: questionText,
            options: options,
            correctAnswer: correctAnswer,
          });
          await newQuestion.save();
        }
      }

      return res.status(200).json({ data: questionsData, msg: 'Questions uploaded successfully.' });
    }).catch((err) => {
      console.log('Error extracting content from Word document:', err);
      return res.status(500).send('Internal Server Error');
    });
  } catch (error) {
    console.error('Error uploading questions:', error);
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
