# AI-Powered Discovery Engine

## Personalized Multi-Intent Product Recommendation & Discovery Engine

---

## Description

The AI-Powered Discovery Engine is an intelligent recommendation system designed to improve the online shopping experience by understanding customer behavior, preferences, and real-time shopping intent. Traditional recommendation systems mainly rely on purchase history, often recommending similar products repeatedly. This project overcomes that limitation by analyzing user interactions such as browsing history, search queries, product views, clicks, and session behavior to generate highly personalized recommendations.

The platform combines Artificial Intelligence, Semantic Search, Vector Similarity Search, and Recommendation Algorithms to provide relevant product suggestions. It helps users discover products based on their current interests rather than only historical purchases. The system also supports explainable recommendations, allowing users to understand why a particular product is being suggested.

The application follows a scalable microservice architecture consisting of a React frontend, Spring Boot backend, MySQL database, and a Python-based AI recommendation service. Sentence Transformer models convert products and user queries into vector embeddings, while FAISS performs high-speed similarity searches. The recommendation engine ranks candidate products and returns the most relevant results to the user.

This project is suitable for modern e-commerce platforms because it improves customer engagement, increases product discovery, solves the cold-start recommendation problem, and provides a personalized shopping experience. The modular architecture also enables easy deployment using Docker and Kubernetes while maintaining security through JWT authentication and REST APIs.

---

## System Flowchart

```text
                              USER
                                │
                                ▼
                   React Frontend (Vite)
                                │
                                ▼
                 Spring Boot REST API Server
                                │
          ┌─────────────────────┴─────────────────────┐
          │                                           │
          ▼                                           ▼
   Authentication Module                      Product Module
          │                                           │
          └─────────────────────┬─────────────────────┘
                                ▼
                         MySQL Database
                                │
                                ▼
                 User Activity & Product Data
                                │
                                ▼
                  AI Recommendation Service
                      (Python + FastAPI)
                                │
                                ▼
                Sentence Transformer Embeddings
                                │
                                ▼
                     FAISS Vector Similarity Search
                                │
                                ▼
                   Recommendation Ranking Engine
                                │
                                ▼
                 Personalized Product Suggestions
                                │
                                ▼
                  Explainable Recommendation Layer
                                │
                                ▼
                      Results Displayed to User
```

---

## Workflow

```text
User Login
     │
     ▼
Browse/Search Products
     │
     ▼
Collect User Activity
     │
     ▼
Generate Product & Query Embeddings
     │
     ▼
FAISS Semantic Search
     │
     ▼
Recommendation Engine
     │
     ▼
Rank Products
     │
     ▼
Generate Personalized Results
     │
     ▼
Display Recommendations
```
