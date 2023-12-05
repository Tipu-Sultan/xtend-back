const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./models/db');
require('dotenv').config();
const port = process.env.PORT || 8050
const uploadRoutes = require('./routes/upload')
const QuestionRoutes = require('./routes/questionRoutes')
//middleware
const app = express();
app.use(bodyParser.json());
app.use(express.json());
const corsOptions = {
  origin: "*", // Allow only this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow credentials (e.g., cookies)
};
if (process.env.NODE_ENV === "production") {
  app.use(cors(corsOptions));
} else {
  app.use(cors());
}

// Connect to MongoDB
connectDB()

app.use(uploadRoutes)
app.use(QuestionRoutes)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
