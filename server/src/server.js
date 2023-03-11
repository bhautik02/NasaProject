const app = require('./app');
const http = require('http');
const { mongoConnect } = require('./services/mongo');

const { loadPlanetsData } = require('./models/planets.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await await loadPlanetsData();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
    console.log(`http://localhost:${PORT}`);
  });
}

startServer();
