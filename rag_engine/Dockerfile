# 1. Start from a minimal Python image
FROM python:3.10-slim

# 2. Set the working directory inside the container
WORKDIR /app

RUN pip3 install pdfplumber
# 3. Copy requirements.txt and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt


# 4. Copy all remaining rag_engine source code into /app
COPY . .

