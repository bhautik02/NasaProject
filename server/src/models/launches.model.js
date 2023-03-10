const launchesData = require('./launches.mongo');
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

saveLaunches(launch);

// Check weather launch with particular id exist
function existLaunchWithId(launchId) {
  return launches.has(launchId);
}

//for mongoose
async function saveLaunches(launch) {
  await launchesData.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
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

function addNewLaunch(launch) {
  latestFlightNumber++;
  // Setting new launch to our launches object
  launches.set(
    latestFlightNumber,
    Object.assign(launch, {
      flightNumber: latestFlightNumber,
      success: true,
      upcoming: true,
      customers: ['ZTM', 'NASA'],
    })
  );
}

// Deleting launch by using id
function abortLaunchById(launchId) {
  const aborted = launches.get(launchId);
  aborted.upcoming = false;
  aborted.success = false;
  return aborted;
}

launches.set(launch.flightNumber, launch);

module.exports = {
  existLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
};
