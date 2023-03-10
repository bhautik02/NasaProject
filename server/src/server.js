const app = require('./app');
const http = require('http');
const mongoose = require('mongoose');

const { loadPlanetsData } = require('./models/planets.model');

const PORT = process.env.PORT || 8000;

const MONGO_URL =
  'mongodb+srv://bhautik02:2YhZjkZprCwELevz@nasacluster.nv87djh.mongodb.net/nasa?retryWrites=true&w=majority';

const server = http.createServer(app);

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', err => {
  console.error(err);
});

async function startServer() {
  await mongoose.connect(MONGO_URL);
  await loadPlanetsData();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
    console.log(`http://localhost:${PORT}`);
  });
}

startServer();
