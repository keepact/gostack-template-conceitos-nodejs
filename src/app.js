const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequest(request, response, next) {
  const { method, url } = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

function validateRepositorieId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({
      error: "Invalid repository ID"
    });
  }

  return next();
}

app.use(logRequest);
app.use('/repositories/:id', validateRepositorieId);

app.get('/repositories', (request, response) => {
  const { title } = request.query;

  const repos = title ? repositories.filter(
    repo => repo.title.includes(title)) : repositories;

  return response.status(200).json(repos);
});

app.post('/repositories', (request, response) => {
 const { title, url, techs } = request.body;

  const repo = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  }

  repositories.push(repo);

  return response.status(201).json(repo);
});

app.put('/repositories/:id', (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repoIndex = repositories.findIndex(repo => repo.id === id);

  repositories[repoIndex] = {
    id,
    title,
    url,
    techs,
    likes: repositories[repoIndex].likes,
  };

  return response.status(200).json(repositories[repoIndex]);
});

app.delete('/repositories/:id', (request, response) => {
  const { id } = request.params;

  const repoIndex = repositories.findIndex(repo => repo.id === id);

  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});

app.post('/repositories/:id/like', (request, response) => {
  const { id } = request.params;

  const repoIndex = repositories.findIndex(repo => repo.id === id);

  if (repoIndex < 0) {
    return response.status(400).json({
      error: 'Repository not found'
    });
  }

  repositories[repoIndex].likes += 1;

  return response.status(200).json(repositories[repoIndex]);
});

module.exports = app;
