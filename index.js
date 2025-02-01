require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
const connectDB = require("./util/db");

// Models
const Rescuee = require("./models/rescuee");
const Consent = require("./models/consent");
const Coordinates = require("./models/coordinates");

// Simulate smartband data movement (Remove after demo.)
function simulateMovement() {
  setInterval(async () => {
    const coordinates = await Coordinates.find();
    if (coordinates.length < 1) {
      return;
    }
    coordinates.forEach(async (coordinate) => {
      coordinate.latitude += Math.random() * 0.002;
      coordinate.longitude += Math.random() * 0.002;
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

app.listen(process.env.PORT, async () => {
  await connectDB();
  console.log(`Server is running on port http://127.0.0.1:${process.env.PORT}`);
  simulateMovement();
});

let test = async () => {
  let data = await fetch("http://127.0.0.1:8000/coordinates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      macAddress: null,
      latitude: null,
      longitude: null,
    }),
  });
  let format = await data.json();
  console.log(format);
};

test();
