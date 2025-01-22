const Coordinates = require('./Models/Coordinate');

// Function to generate random coordinate offset (±0.001 degrees ~ 100m)
function getRandomOffset() {
    return (Math.random() - 0.5) * 0.002;
}

// Function to update coordinates
async function updateRandomCoordinates(simulatorMode) {
    try {
        // Check if simulator mode is enabled
        if (!simulatorMode) {
            return;
        }

        // Get a random coordinate record
        const coordinate = await Coordinates.findOne();
        
        if (coordinate) {
            // Generate new coordinates within ~100m of original position
            const newLongitude = coordinate.longtitude + getRandomOffset();
            const newLatitude = coordinate.latitude + getRandomOffset();
            
            // Update the coordinate
            coordinate.longtitude = newLongitude;
            coordinate.latitude = newLatitude;
            coordinate.timestamp = new Date();
            
            await coordinate.save();
            console.log(`[Simulator] Updated coordinates for device ${coordinate.macAddress}`);
            console.log(`[Simulator] New position: ${newLatitude}, ${newLongitude}`);
        } else {
            console.log('[Simulator] No coordinates found in database');
        }
    } catch (error) {
        console.error('[Simulator] Error updating coordinates:', error);
    }
}

// Export the simulator function
module.exports = {
    startSimulator: (simulatorMode) => {
        let interval;
        if (simulatorMode) {
            interval = setInterval(async () => await updateRandomCoordinates(simulatorMode), 15000);
            console.log('[Simulator] Coordinate simulator started...');
        } else {
            console.log('[Simulator] Coordinate simulator stopped...');
        }
    }
};


