# RAG Project

[![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue?logo=python)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready Retrieval-Augmented Generation (RAG) backend using Node.js, Python, MongoDB, and Docker.  
Supports document upload, chunking, embedding, FAISS indexing, and semantic search via API.

---

## 🚀 Features

- User authentication (JWT)
- PDF document upload with page and count limits
- Python-powered chunking, embedding, and FAISS indexing
- Semantic search API (HuggingFace/ChatGroq integration)
- MongoDB for metadata storage
- Fully dockerized for easy deployment

---

## 🐳 Quick Start (Docker Compose)

```sh
git clone https://github.com/yourusername/your-repo.git
cd your-repo
cp backend/.env.example backend/.env  # Edit with your secrets
docker compose up --build
```

The backend will be available at [http://localhost:5000](http://localhost:5000).

---

## ⚙️ Environment Variables

Create a `backend/.env` file with:

```
CHATGROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb://mongo:27017/rag_project_db
PORT=5000
PYTHON_PATH=/opt/venv/bin/python
```

---

## 📦 API Endpoints

### Auth

- **POST** `/api/auth/register`  
  `{ "email": "user@example.com", "password": "yourpassword" }`

- **POST** `/api/auth/login`  
  `{ "email": "user@example.com", "password": "yourpassword" }`

### Document Upload

- **POST** `/api/upload/file`  
  Headers: `Authorization: Bearer <token>`  
  Form-data: `document` (PDF file)

### Document Metadata

- **GET** `/api/docs`  
  Headers: `Authorization: Bearer <token>`

- **GET** `/api/docs/:id`  
  Headers: `Authorization: Bearer <token>`

### Search

- **GET** `/api/search?q=your+query`  
  Headers: `Authorization: Bearer <token>`

### Health Check
- **GET** `/`  
  Returns: `"RAG Backend is up and running"`

---
## 🗂️ Project Structure

```
backend/
  app.js
  controllers/
  models/
  routes/
  rag_engine/         # Python scripts for chunking, embedding, indexing, search
  uploads/            # (gitignored) user-uploaded files
  .env
docker-compose.yml
```

---

## 🛠️ Development

- **Lint JS:** `npx eslint . --fix` (in `backend/`)
- **Lint Python:** `black .` and `flake8 .` (in `rag_engine/`)
- **Run locally:**  
  - Start MongoDB
  - `cd backend && npm install && npm start`

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

- [LangChain](https://github.com/hwchase17/langchain)
- [HuggingFace](https://huggingface.co/)
- [FAISS](https://github.com/facebookresearch/faiss)
- [Docker](https://www.docker.com/)

