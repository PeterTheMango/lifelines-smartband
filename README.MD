# SmartBand Backend Server

## Description
This is the backend server component of the SmartBand system, responsible for receiving and managing data from smart wearable devices. The server handles real-time location tracking, data storage, and provides API endpoints for device communication.

## Features
- Real-time location tracking of wearable devices
- MongoDB integration for data persistence
- RESTful API endpoints for device communication
- Support for multiple device tracking
- Timestamp-based coordinate updates

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up MongoDB connection: Update the connection string in `index.js`
4. Start the server: `npm start`

## Usage
- Send location data to the server: POST `/coordinates` with JSON payload containing `macAddress`, `longtitude`, and `latitude`
- Retrieve location data: GET `/coordinates` to fetch all coordinates

## API Endpoints
- POST `/coordinates`: Send location data
- GET `/coordinates`: Retrieve all coordinates

##Acknowledgements
- Lots of the code issues we had were diagnosed with AI mainly through [ChatGPT - 4o](https://chatgpt.com) as well as using an AI powered Code Editor like [Cursor](https://www.cursor.com/).

## License
This project is open-sourced under the MIT License - see the LICENSE file for details.
