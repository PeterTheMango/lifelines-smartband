import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Pressable,
  Text,
  View,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Link } from 'expo-router';
import { Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { WebView } from "react-native-webview";
import { useNavigation } from '@react-navigation/native';

// Add this helper function at the top level
const generateRandomMAC = () => {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
  ).join(':');
};

// Update the MarkerLocation type
type MarkerLocation = {
  id: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  macAddress: string;  // Add this field
};

// Update the marker generation function
const generateDohaMarkers = (): MarkerLocation[] => {
  const dohaCenter = {
    latitude: 25.2854,
    longitude: 51.5310
  };

  return Array.from({ length: 10 }, (_, index) => {
    // Increase the offset range to make markers more visible
    const latOffset = (Math.random() - 0.5) * 0.01;  // Increased spread
    const lngOffset = (Math.random() - 0.5) * 0.01;  // Increased spread

    return {
      id: index + 1,
      coordinate: {
        latitude: dohaCenter.latitude + latOffset,
        longitude: dohaCenter.longitude + lngOffset,
      },
      title: `Location ${index + 1}`,
      description: `Test marker ${index + 1}`,
      macAddress: generateRandomMAC()
    };
  });
};

// Add this helper function at the top level
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Add new type for road obstructions
type RoadObstruction = {
  id: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
};

const LocationTrackerMenu = () => {
  const navigation = useNavigation();
  const currentLocation = {
    latitude: 25.2854,
    longitude: 51.5310
  };

  // Add state for road obstructions
  const [roadObstructions, setRoadObstructions] = useState<RoadObstruction[]>([]);

  // Add state for random coordinates if not already present
  const [randomCoordinates, setRandomCoordinates] = useState([
    {
      latitude: currentLocation.latitude + 0.001,
      longitude: currentLocation.longitude + 0.001,
    },
    {
      latitude: currentLocation.latitude - 0.001,
      longitude: currentLocation.longitude - 0.001,
    },
    {
      latitude: currentLocation.latitude + 0.002,
      longitude: currentLocation.longitude - 0.002,
    },
  ]);

  // Add function to handle road obstruction reporting
  const handleReportObstruction = () => {
    const newObstruction: RoadObstruction = {
      id: Date.now(),
      coordinate: { ...currentLocation },
      timestamp: new Date(),
    };
    setRoadObstructions([...roadObstructions, newObstruction]);
  };

  // Add function to check for nearby obstructions
  const nearbyObstruction = roadObstructions.find(obstruction => {
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      obstruction.coordinate.latitude,
      obstruction.coordinate.longitude
    );
    return distance <= 0.1; // 0.1 km = 100m
  });

  // Add function to handle road clearance
  const handleReportClearance = () => {
    if (nearbyObstruction) {
      setRoadObstructions(roadObstructions.filter(obs => obs.id !== nearbyObstruction.id));
    }
  };

  const [markers, setMarkers] = useState<MarkerLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the getData function
  async function getData() {

    let data = await fetch(`127.0.0.1:3000/coordinates`);
    data = await data.json();
    return data;
  }

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const data = await getData();
        console.log(data)
        

        if (!data.success || !Array.isArray(data.coordinates)) {
          throw new Error('Invalid data format received');
        }

        const transformedData = data.coordinates.map((coord: any, index: number) => ({
          id: index + 1,
          coordinate: {
            latitude: parseFloat(coord.latitude),
            longitude: parseFloat(coord.longitude)
          },
          title: coord.macAddress,
          description: `Distance: calculating...`,
          macAddress: coord.macAddress
        }));

        setMarkers(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCoordinates();

    // Set up interval for periodic fetching
    const interval = setInterval(fetchCoordinates, 15000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const mapRef = React.useRef<MapView>(null);  // Add this ref

  const centerToCurrentLocation = () => {
    mapRef.current?.animateToRegion({
      latitude: 25.2854,
      longitude: 51.5310,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <WebView
          style={styles.map}
          source={{ uri: "https://www.google.com/maps" }}
        />
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 25.2854,
              longitude: 51.5310,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation={false}
            showsMyLocationButton={true}
            provider={PROVIDER_GOOGLE}
            minZoomLevel={10}
            maxZoomLevel={20}
          >
            {/* Current location marker */}
            <Marker
              coordinate={currentLocation}
              title="Current Location"
            >
              <View style={styles.currentLocationMarker}>
                <View style={styles.markerDot} />
                <View style={styles.markerPulse} />
              </View>
            </Marker>

            {/* Random Coordinates Markers */}
            {randomCoordinates.map((coord, index) => (
              <Marker
                key={`random-${index}`}
                coordinate={coord}
                title={`Location ${index + 1}`}
              >
                <View style={styles.redMarker} />
              </Marker>
            ))}

            {/* Other markers */}
            {markers.map(marker => (
              <Marker
                key={`device-${marker.id}`}
                coordinate={marker.coordinate}
                title={marker.macAddress}
                description={`Distance: ${calculateDistance(
                  currentLocation.latitude,
                  currentLocation.longitude,
                  marker.coordinate.latitude,
                  marker.coordinate.longitude
                ).toFixed(2)}km`}
              >
                <View style={styles.redMarker} />
              </Marker>
            ))}

            {/* Add road obstruction markers */}
            {roadObstructions.map(obstruction => (
              <Marker
                key={obstruction.id}
                coordinate={obstruction.coordinate}
                title="Road Obstruction"
                description={`Reported at ${obstruction.timestamp.toLocaleTimeString()}`}
                pinColor="yellow"
              />
            ))}
          </MapView>
          <Pressable
            style={styles.centerButton}
            onPress={centerToCurrentLocation}
          >
            <Text style={styles.centerButtonText}>📍</Text>
          </Pressable>
        </>
      )}
      {/* <Link href="/explore">
      <Pressable style={styles.menu}>
        <Image
          style={styles.icon}
          resizeMode="cover"
          source={require("../../assets/images/Menu.png")}
        />
      </Pressable>
      </Link> */}

      <View style={styles.reportRoadObstructionWrapper}>
        <Pressable
          style={styles.reportRoadObstruction}
          onPress={handleReportObstruction}
        >
          <Text style={styles.reportText}>{`Report Road\nObstruction`}</Text>
        </Pressable>
      </View>

      <View style={styles.warningNotificationContainer}>
        {error && (
          <View style={styles.errorNotification}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {nearbyObstruction && (
          <View style={styles.warningNotification}>
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningText}>
                Warning! Road Obstacle Ahead (~100m)
              </Text>
            </View>
            <Pressable
              style={styles.roadClearanceButton}
              onPress={handleReportClearance}
            >
              <Text style={styles.reportText}>{`Report Road\nClearance`}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.nearbyDevices}>
          <View style={styles.nearbyDevicesHeader}>
            <Text style={styles.nearbyDevicesTitle}>Nearby Devices</Text>
          </View>
          <ScrollView style={styles.devicesList}>
            {markers.map((marker, index) => (
              <Pressable key={index} style={styles.deviceItem}>
                <View style={styles.deviceStatusButton}>
                  <Link href="/confirm_details">
                    <Text style={styles.rescueText}>{`Mark as\nRescued`}</Text>
                  </Link>
                </View>
                <View style={styles.deviceInfo}>
                  <View>
                    <Text style={styles.deviceText}>
                      {marker.macAddress}
                    </Text>
                  </View>
                  <Text style={styles.distanceText}>
                    {`~${calculateDistance(
                      currentLocation.latitude,
                      currentLocation.longitude,
                      marker.coordinate.latitude,
                      marker.coordinate.longitude
                    ).toFixed(2)}km`}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  menu: {
    position: "absolute",
    left: 20,
    top: 30,
    width: 40,
    height: 40,
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  reportRoadObstructionWrapper: {
    position: "absolute",
    top: 20,
    right: 10,
    padding: 10,
  },
  reportRoadObstruction: {
    backgroundColor: "#ff0000",
    borderRadius: 50,
    padding: 10,
    alignItems: "center",
    opacity: 1,  // Add this
  },
  reportText: {
    textAlign: "center",
    color: "#fff",
    fontFamily: "Inter-Regular",
    fontSize: 12,
    flexWrap: 'wrap',
    maxWidth: 100,
  },
  warningNotificationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 20,
  },
  nearbyDevices: {
    marginTop: 20,
    backgroundColor: "#bfc3ba",
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
    maxHeight: 300,
  },
  nearbyDevicesHeader: {
    backgroundColor: "#a9aca9",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginBottom: 10,
  },
  nearbyDevicesTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    textAlign: "center",
  },
  devicesList: {
    width: '100%',
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 10,
    backgroundColor: "rgba(169, 172, 169, 0.5)",
    borderRadius: 100,
    width: "110%",
    alignSelf: 'center',
  },
  deviceStatusButton: {
    backgroundColor: "rgba(25, 218, 25, 0.65)",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 100,
  },
  rescueText: {
    fontSize: 12,
    color: "#000",
    textAlign: "center",
  },
  deviceInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
  deviceText: {
    fontSize: 12,
    color: "#000",
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 12,
    color: "#000",
    fontWeight: 'bold',
  },
  centerButton: {
    position: 'absolute',
    bottom: 250,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  centerButtonText: {
    fontSize: 20,
  },
  currentLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 1,
    borderColor: 'white',
  },
  markerPulse: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  redMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: 'white',
  },
  warningNotification: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    flexWrap: 'nowrap',
  },
  warningTextContainer: {
    flex: 1,
    marginRight: 10,
    flexShrink: 1,
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flexWrap: 'wrap',
  },
  roadClearanceButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexShrink: 0,
    minWidth: 80,
  },
  errorNotification: {
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  errorText: {
    color: '#D8000C',
    textAlign: 'center',
  },
});

export default LocationTrackerMenu;