# rag_project/backend/Dockerfile

FROM node:18-alpine
WORKDIR /app

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

# Copy Node.js app files
COPY backend/package*.json ./
RUN npm install --production

# Copy and install Python requirements
COPY rag_engine/requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy backend and rag_engine code
COPY backend/ ./
COPY rag_engine/ /app/rag_engine/

EXPOSE 5000
CMD ["npm", "start"]
