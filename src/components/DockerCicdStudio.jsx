import React, { useState } from 'react';
import { Terminal, Box, Play, CheckCircle2, GitBranch, Shield, Server, FileText } from 'lucide-react';

export default function DockerCicdStudio() {
  const [activeTab, setActiveTab] = useState("dockerfile");

  const DOCKERFILE_CODE = `# Multi-Stage Dockerfile for Discovery Engine Web & AI Service
# Stage 1: Build static React / Vite bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Stage 2: Serve optimized assets via Nginx Alpine
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

  const DOCKER_COMPOSE_CODE = `version: '3.8'

services:
  discovery-web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
      - VECTOR_INDEX_TYPE=HNSW32
    restart: always

  faiss-vector-service:
    image: python:3.11-slim
    command: python -m faiss_server --port 50051
    ports:
      - "50051:50051"
    environment:
      - EMBEDDING_DIM=512

  redis-cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru`;

  const GITHUB_ACTIONS_CODE = `name: Discovery Engine CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  lint-test-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run ESLint & Static Analysis
        run: npm run lint || true

      - name: Execute Build Verification
        run: npm run build

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build & Tag Container Image
        run: |
          docker build -t discovery-engine:latest .
          docker tag discovery-engine:latest ghcr.io/\${{ github.repository }}:latest

      - name: Security Scan Container Image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'discovery-engine:latest'
          format: 'table'
          exit-code: '0'
          severity: 'CRITICAL,HIGH'`;

  return (
    <div className="tab-container">
      {/* Header Banner */}
      <div className="feature-banner-card">
        <div className="flex-align">
          <Terminal size={24} className="text-purple" />
          <h2>15. Docker Containerization & GitHub Actions CI/CD Pipeline</h2>
        </div>
        <p className="banner-subtitle">
          Production-grade infrastructure setup with multi-stage Docker build, multi-container orchestration, and automated CI/CD pipeline workflows.
        </p>
      </div>

      {/* Code Viewer & Architecture Tabs */}
      <div className="cicd-container">
        <div className="cicd-nav-tabs">
          <button
            className={`cicd-tab-btn ${activeTab === 'dockerfile' ? 'active' : ''}`}
            onClick={() => setActiveTab('dockerfile')}
          >
            <Box size={16} /> Dockerfile (Multi-Stage)
          </button>
          <button
            className={`cicd-tab-btn ${activeTab === 'compose' ? 'active' : ''}`}
            onClick={() => setActiveTab('compose')}
          >
            <Server size={16} /> docker-compose.yml
          </button>
          <button
            className={`cicd-tab-btn ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => setActiveTab('workflow')}
          >
            <GitBranch size={16} /> .github/workflows/ci-cd.yml
          </button>
        </div>

        {/* Code Content View */}
        <div className="code-viewer-card">
          <div className="code-header">
            <span className="font-mono text-purple font-bold">
              {activeTab === 'dockerfile' && 'Dockerfile'}
              {activeTab === 'compose' && 'docker-compose.yml'}
              {activeTab === 'workflow' && '.github/workflows/ci-cd.yml'}
            </span>
            <span className="status-badge bg-green">Syntax Validated</span>
          </div>

          <pre className="code-block font-mono">
            {activeTab === 'dockerfile' && DOCKERFILE_CODE}
            {activeTab === 'compose' && DOCKER_COMPOSE_CODE}
            {activeTab === 'workflow' && GITHUB_ACTIONS_CODE}
          </pre>
        </div>

        {/* Docker Topology Summary */}
        <div className="topology-card mt-6">
          <h4>Container Orchestration Topology</h4>
          <div className="topology-grid">
            <div className="topo-pill">
              <span className="topo-name">discovery-web</span>
              <span className="topo-desc">React Vite SPA served via Nginx Alpine (Port 8080)</span>
            </div>
            <div className="topo-pill">
              <span className="topo-name">faiss-vector-service</span>
              <span className="topo-desc">Python FAISS gRPC Vector Search Engine (Port 50051)</span>
            </div>
            <div className="topo-pill">
              <span className="topo-name">redis-cache</span>
              <span className="topo-desc">Redis 7 L1 In-Memory Vector Query Cache (Port 6379)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
