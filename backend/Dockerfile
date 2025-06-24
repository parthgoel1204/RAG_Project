# rag_project/backend/Dockerfile

FROM node:18-slim
WORKDIR /app

# Install Python and pip (use apt-get for Debian/Ubuntu)
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Copy Node.js app files
COPY backend/package*.json ./
RUN npm install --production

# Copy and install Python requirements in a virtual environment
COPY rag_engine/requirements.txt ./
ENV PIP_DEFAULT_TIMEOUT=1000
RUN python3 -m venv /opt/venv \
    && . /opt/venv/bin/activate \
    && pip install --no-cache-dir -r requirements.txt
ENV PATH="/opt/venv/bin:$PATH"

# Copy backend and rag_engine code
COPY backend/ ./
COPY rag_engine/ /app/rag_engine/

EXPOSE 5000
CMD ["npm", "start"]