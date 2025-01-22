require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

let simulator_mode = false;

const { startSimulator } = require('./simulator');
startSimulator(simulator_mode);

// Add CORS middleware
app.use(cors());

// MongoDB connection which stops the program if it cannot connect to the server
try{
  mongoose.connect(process.env.MONGODB_URI);
} catch {
  throw new Error("Unable to start program, invalid MONGO_URI credentials or connection cannot be made.");
}

// Define Database Schemas
const Coordinates = require('./Models/Coordinate');
const Rescuee = require('./Models/Rescuee');

app.use(express.json());

// POST route to receive SmartBand device data
app.post('/coordinates', async (req, res) => {
  try {
    const { macAddress, longtitude, latitude } = req.body;
    
    const existingCoordinate = await Coordinates.findOne({ macAddress });

    if (existingCoordinate) {
      existingCoordinate.longtitude = longtitude;
      existingCoordinate.latitude = latitude;
      existingCoordinate.timestamp = new Date();
      await existingCoordinate.save();
      res.status(200).json({ message: 'Coordinates updated successfully' });
    } else {
      const newCoordinate = new Coordinates({
        macAddress,
        longtitude,
        latitude,
        timestamp: new Date()
      });
      await newCoordinate.save();
      res.status(201).json({ message: 'Coordinates saved successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error saving coordinates' });
  }
});

// GET route to fetch all coordinates for frontend
app.get('/coordinates', async (req, res) => {
  try {
    const coordinates = await Coordinates.find({});
    
    const formattedCoordinates = coordinates.map((coord, index) => ({
      id: index + 1,
      coordinate: {
        latitude: coord.latitude,
        longtitude: coord.longtitude
      },
      title: coord.title,
      description: coord.description,
      macAddress: coord.macAddress
    }));

    res.json(formattedCoordinates);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching coordinates' });
  }
});

// POST route to save rescuee data
app.post('/rescuee', async (req, res) => {
  try {
    const { macAddress, name, id, nationality, gender, dateOfBirth, phone, address } = req.body;
    
    const existingRescuee = await Rescuee.findOne({ macAddress });

    if (existingRescuee) {
      existingRescuee.name = name;
      existingRescuee.id = id;
      existingRescuee.nationality = nationality;
      existingRescuee.gender = gender;
      existingRescuee.dateOfBirth = dateOfBirth;
      existingRescuee.phone = phone;
      existingRescuee.address = address;
      await existingRescuee.save();
      res.status(200).json({ message: 'Rescuee data updated successfully' });
    } else {
      const newRescuee = new Rescuee({
        macAddress,
        name,
        id,
        nationality,
        gender,
        dateOfBirth,
        phone,
        address
      });
      await newRescuee.save();
      res.status(201).json({ message: 'Rescuee data saved successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error saving rescuee data' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
