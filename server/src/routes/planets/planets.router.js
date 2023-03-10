const express = require("express");
const { httpGetAllPlanets } = require("./planets.controller");

const planetsRouter = express.Router();

// Hitting /planets endpoint
planetsRouter.get("/", httpGetAllPlanets);

module.exports = planetsRouter;
