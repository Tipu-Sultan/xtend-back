const express = require('express');
const router = express.Router();
const multer = require('multer');
const mammoth = require('mammoth')
const Question = require('../models/question')

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/api/upload', upload.single('file'), async function (req, res, next) {
    try {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        const text = result.value;

        const questionsData = text.split(/\n{3,}/);

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

                // Save the question to the database
                await newQuestion.save();
            }
        }

        return res.status(200).json({ data: text, msg: 'Questions uploaded successfully.' });
    } catch (error) {
        console.error('Error uploading questions:', error);
        return res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
