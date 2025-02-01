require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
const connectDB = require("./util/db");

// Models
const Rescuee = require("./models/rescuee");
const Consent = require("./models/consent");
const Coordinates = require("./models/coordinates");
const Obstacle = require("./models/obstacle");

// Simulate smartband data movement (Remove after demo.)
function simulateMovement() {
  setInterval(async () => {
    const coordinates = await Coordinates.find();
    if (coordinates.length < 1) {
      return;
    }
    coordinates.forEach(async (coordinate) => {
      coordinate.latitude += (Math.random() - 0.5) * 0.0002;
      coordinate.longitude += (Math.random() - 0.5) * 0.0002;
      await coordinate.save();
    });
  }, 5000);
  return;
}

app.get("/coordinates", async (req, res) => {
  const coordinates = await Coordinates.find();
  if (coordinates.length < 1) {
    return res
      .status(201)
      .json({ message: "No coordinates found in the database." });
  }
  return res.status(200).json(coordinates);
});

app.get("/rescuee", async (req, res) => {
  const rescuees = await Rescuee.find();
  if (rescuees.length < 1) {
    return res
      .status(201)
      .json({ message: "No rescuees found in the database." });
  }
  return res.status(200).json(rescuees);
});

app.post("/coordinates", async (req, res) => {
  const { macAddress, latitude, longitude } = req.body;
  if (!macAddress || !latitude || !longitude) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  let existingCoordinates = await Coordinates.findOne({
    macAddress: macAddress,
  });

  if (existingCoordinates) {
    if (
      existingCoordinates.latitude === latitude &&
      existingCoordinates.longitude === longitude
    ) {
      return res.status(200).json({ message: "Coordinates Saved." });
    }
    existingCoordinates.latitude = latitude;
    existingCoordinates.longitude = longitude;
    await existingCoordinates.save();
    return res.status(200).json({ message: "Coordinates updated!" });
  } else {
    const newCoordinates = new Coordinates({ macAddress, latitude, longitude });
    await newCoordinates.save();
    return res.status(201).json({ message: "Data Saved Successfully" });
  }
});

app.post("/rescuee", async (req, res) => {
  const {
    serialNumber,
    macAddress,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    address,
    phoneNumber,
  } = req.body;

  console.log(req.body);

  let isExistingConsent = await Consent.findOne({ serialNumber: serialNumber });

  if (!isExistingConsent) {
    return res.status(400).json({ message: "Consent not found." });
  }

  let existingRescuee = await Rescuee.findOne({ serialNumber: serialNumber });

  if (existingRescuee) {
    return res.status(400).json({ message: "Rescuee already exists." });
  }

  const newRescuee = new Rescuee({
    serialNumber,
    macAddress,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    address,
    phoneNumber,
  });

  await newRescuee.save();

  return res.status(201).json({ message: "Rescuee saved successfully." });
});

app.post("/consent", async (req, res) => {
  const { firstName, lastName, serialNumber, country, nationalId } = req.body;

  let existingConsent = await Consent.findOne({ serialNumber: serialNumber });

  if (existingConsent) {
    return res.status(400).json({ message: "Consent already exists." });
  }

  const newConsent = new Consent({
    firstName,
    lastName,
    serialNumber,
    country,
    nationalId,
  });

  await newConsent.save();

  return res.status(201).json({ message: "Consent saved successfully." });
});

app.post("/obstacle", async (req, res) => {
  const { obstacleId } = req.body;
  const newObstacle = new Obstacle({ obstacleId });
  await newObstacle.save();
  return res.status(201).json({ message: "Obstacle saved successfully." });
});

app.put("/obstacle", async (req, res) => {
  const obstacles = await Obstacle.find();
  if (obstacles.length < 1) {
    return res
      .status(201)
      .json({ message: "No obstacles found in the database." });
  } else {
    const lastObstacle = obstacles[obstacles.length - 1];
    await Obstacle.findByIdAndDelete(lastObstacle._id);
    return res
      .status(200)
      .json({ message: "Last obstacle removed successfully." });
  }
});

app.listen(process.env.PORT, "0.0.0.0", async () => {
  await connectDB();
  console.log(`Server is running on port http://127.0.0.1:${process.env.PORT}`);
  // simulateMovement();
});
