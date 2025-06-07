require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  PYTHON_PATH : "python3",

  CHATGROQ_API_KEY: process.env.CHATGROQ_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET
};
