# HabitTracker

HabitTracker is a web application for tracking habits, built with **React + Vite (frontend)** and **Node.js + Express (backend)**. Data is stored in a database (e.g., PostgreSQL).

## Running locally

### Backend
From the `server` folder:

```bash
npm install          # install dependencies
```
```bash
cp .env.example .env # prepare .env file
```
```bash
npm run dev          # start express server
```

### Frontend
From the app folder:
```bash
npm install          # install dependencies
```
```bash
npm run dev          # start frontend
```

Running globally with Docker Compose
```bash
docker-compose build  # build images
```
```bash
docker-compose up     # start all services
```
```bash
docker-compose down   # stop all services
```