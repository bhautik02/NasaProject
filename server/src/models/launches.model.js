const axios = require('axios');
const launchesData = require('./launches.mongo');
const planets = require('./planets.mongo');
const DEFAULT_FLIGHT_NUMBER = 100;
const launches = new Map();

// // let latestFlightNumber = 100;

// // const launch = {
// //   flightNumber: 100, //flight_number
// //   mission: 'Kepler Exploration X', //name
// //   rocket: 'Explorer IS1', //rocket.name
// //   launchDate: new Date('December 27, 2030'), //date_local
// //   target: 'Kepler-442 b', //not apllicable
// //   customers: ['ISRO', 'NASA'], //payload.customers
// //   upcoming: true, //upcoming
// //   success: true, //success
// // };

// saveLaunch(launch);

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateData() {
  console.log('Downloading launch data');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log('Problem Downloading launch data');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap(payload => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name, //name
      rocket: launchDoc['rocket']['name'], //rocket.name
      launchDate: launchDoc.date_local, //date_local
      // target: 'Kepler-442 b', //not apllicable
      customers, //payload.customers
      upcoming: launchDoc.upcoming, //upcoming
      success: launchDoc.success, //success
    };

    saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('Launch already exists.');
  } else {
    await populateData();
  }
}

async function findLaunch(filter) {
  return await launchesData.findOne(filter);
}
// Check weather launch with particular id exist
async function existLaunchWithId(launchId) {
  return await findLaunch({
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

async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values());
  return await launchesData
    .find(
      {},
      {
        __v: 0,
        _id: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

//for mongoose
async function saveLaunch(launch) {
  await launchesData.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    success: true,
    upcoming: true,
    customers: ['ISRO', 'NASA'],
  });

  await saveLaunch(newLaunch);
}

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

// launches.set(launch.flightNumber, launch);

module.exports = {
  loadLaunchData,
  existLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  // addNewLaunch,
  abortLaunchById,
};
