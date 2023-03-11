const launchesData = require('./launches.mongo');
const planets = require('./planets.mongo');
const DEFAULT_FLIGHT_NUMBER = 100;
const launches = new Map();

let latestFlightNumber = 100;

const launch = {
  flightNumber: 100,
  mission: 'Kepler Exploration X',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2030'),
  target: 'Kepler-442 b',
  customers: ['ISRO', 'NASA'],
  upcoming: true,
  success: true,
};

saveLaunch(launch);

// Check weather launch with particular id exist
async function existLaunchWithId(launchId) {
  return await launchesData.findOne({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesData.findOne().sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches() {
  // return Array.from(launches.values());
  return await launchesData.find(
    {},
    {
      __v: 0,
      _id: 0,
    }
  );
}

//for mongoose
async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  await launchesData.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function scheduleNewLaunch(launch) {
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    success: true,
    upcoming: true,
    customers: ['ISRO', 'NASA'],
  });

  await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   // Setting new launch to our launches object
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       flightNumber: latestFlightNumber,
//       success: true,
//       upcoming: true,
//       customers: ['ZTM', 'NASA'],
//     })
//   );
// }

// Deleting launch by using id
async function abortLaunchById(launchId) {
  const aborted = await launchesData.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
}

launches.set(launch.flightNumber, launch);

module.exports = {
  existLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  // addNewLaunch,
  abortLaunchById,
};
