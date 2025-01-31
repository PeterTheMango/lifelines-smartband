import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Pressable,
  Text,
  View,
  ImageBackground,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Link } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { WebView } from "react-native-webview";
import { useNavigation } from '@react-navigation/native';
import MapViewDirections from 'react-native-maps-directions';  // Add this import


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

// Add new type for rescuer
type Rescuer = {
  id: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  name: string;
};

const LocationTrackerMenu = () => {
  const navigation = useNavigation();
  const currentLocation = {
    latitude: 25.2854,
    longitude: 51.5310
  };

  // Add state for road obstructions
  const [roadObstructions, setRoadObstructions] = useState<RoadObstruction[]>([]);

  const [markers, setMarkers] = useState<MarkerLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerLocation | null>(null);
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;  // Replace with your API key

  // Add rescuers state
  const [rescuers] = useState<Rescuer[]>([
    {
      id: 1,
      coordinate: {
        latitude: 25.2854,
        longitude: 51.5310
      },
      name: "Rescuer 1 (You)"
    },
    {
      id: 2,
      coordinate: {
        latitude: 25.2960,
        longitude: 51.5280
      },
      name: "Rescuer 2"
    },
    {
      id: 3,
      coordinate: {
        latitude: 25.2750,
        longitude: 51.5340
      },
      name: "Rescuer 3"
    },
    {
      id: 4,
      coordinate: {
        latitude: 25.2890,
        longitude: 51.5250
      },
      name: "Rescuer 4"
    }
  ]);

  useEffect(() => {
    let mounted = true;  // Add mounted flag for cleanup

    const generateQatarMarkers = () => {
      try {
        // Define some real Qatar locations for devices (rescuees)
        const qatarLocations = [
          { name: "West Bay", lat: 25.3287, lng: 51.5295 },
          { name: "The Pearl", lat: 25.3741, lng: 51.5503 },
          { name: "Katara", lat: 25.3594, lng: 51.5275 },
          { name: "Souq Waqif", lat: 25.2867, lng: 51.5333 },
          { name: "Education City", lat: 25.3149, lng: 51.4901 },
          { name: "Al Wakrah", lat: 25.1715, lng: 51.6034 },
          { name: "Al Khor", lat: 25.6840, lng: 51.4978 },
          { name: "Lusail", lat: 25.4285, lng: 51.5368 },
          { name: "Duhail", lat: 25.3507, lng: 51.4899 },
          { name: "Al Sadd", lat: 25.2784, lng: 51.5079 }
        ];

        // Generate markers with slight offsets from real locations
        const randomMarkers = qatarLocations.map((location, index) => {
          const latOffset = (Math.random() - 0.5) * 0.002; // Smaller offset for more realistic positioning
          const lngOffset = (Math.random() - 0.5) * 0.002;

          return {
            id: index + 1,
            coordinate: {
              latitude: location.lat + latOffset,
              longitude: location.lng + lngOffset
            },
            title: `Device at ${location.name}`,
            description: `Emergency device near ${location.name}`,
            macAddress: generateRandomMAC()
          };
        });

        if (mounted) {
          setMarkers(randomMarkers);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to generate markers');
          setLoading(false);
        }
      }
    };

    generateQatarMarkers();
    // const intervalId = setInterval(generateQatarMarkers, 15000);

    return () => {
      mounted = false;
      // clearInterval(intervalId);
    };
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

  // Add this function to handle marker selection
  const handleMarkerPress = (marker: MarkerLocation) => {
    setSelectedMarker(marker);
  };

  // Update the isPointNearRoute helper function with a smaller threshold
  const isPointNearRoute = (point, routeCoordinates, threshold = 0.005) => { // 0.005 km = 5 meters
    return routeCoordinates.some(coordinate => 
      calculateDistance(
        point.latitude,
        point.longitude,
        coordinate.latitude,
        coordinate.longitude
      ) < threshold
    );
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
            {/* Rescuer markers */}
            {rescuers.map(rescuer => (
              <Marker
                key={`rescuer-${rescuer.id}`}
                coordinate={rescuer.coordinate}
                title={rescuer.name}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={styles.markerContainer}>
                  <View style={[
                    styles.currentLocationPin,
                    rescuer.id !== 1 && styles.otherRescuerPin
                  ]} />
                  <View style={[
                    styles.pinTail,
                    rescuer.id !== 1 && styles.otherRescuerPinTail
                  ]} />
                </View>
              </Marker>
            ))}

            {/* Current location marker */}
            <Marker
              coordinate={currentLocation}
              title="Current Location"
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.markerContainer}>
                <View style={styles.currentLocationPin} />
                <View style={styles.pinTail} />
              </View>
            </Marker>

            {/* Device markers */}
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
                onPress={() => handleMarkerPress(marker)}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.devicePin} />
                  <View style={styles.devicePinTail} />
                </View>
              </Marker>
            ))}

            {/* Road obstruction markers */}
            {roadObstructions.map(obstruction => (
              <Marker
                key={obstruction.id}
                coordinate={obstruction.coordinate}
                title="Road Obstruction"
                description={`Reported at ${obstruction.timestamp.toLocaleTimeString()}`}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.obstructionPin} />
                  <View style={styles.obstructionPinTail} />
                </View>
              </Marker>
            ))}

            {/* Directions renderer */}
            {selectedMarker && (
              <MapViewDirections
                origin={currentLocation}
                destination={selectedMarker.coordinate}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={5}
                strokeColor="#0066ff"
                mode="DRIVING"
                resetOnChange={true}
                optimizeWaypoints={true}
                waypoints={roadObstructions.map(obstruction => ({
                  latitude: obstruction.coordinate.latitude + 0.00005, // Adjusted offset for 5m radius
                  longitude: obstruction.coordinate.longitude + 0.00005,
                }))}
                onReady={result => {
                  // Check if any obstructions are near the route with 5m threshold
                  const obstructionsNearRoute = roadObstructions.filter(obstruction => 
                    isPointNearRoute(obstruction.coordinate, result.coordinates, 0.005)
                  );

                  if (obstructionsNearRoute.length > 0) {
                    console.log("Obstructions detected within 5m of route, recalculating...");
                  }

                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: 50,
                      bottom: 50,
                      left: 50,
                      top: 50
                    }
                  });
                }}
                onError={(errorMessage) => {
                  console.log('Error:', errorMessage);
                  Alert.alert(
                    "Navigation Error",
                    "Unable to find a clear route. There might be obstructions within 5 meters of the path.",
                    [{ text: "OK" }]
                  );
                }}
                alternatives={true}
                avoidHighways={false}
                avoidFerries={true}
                avoidTolls={false}
              />
            )}
          </MapView>

          {/* Add a clear route button when a route is shown */}
          {selectedMarker && (
            <Pressable
              style={({ pressed }) => [
                styles.clearRouteButton,
                pressed && styles.clearRouteButtonPressed
              ]}
              onPress={() => setSelectedMarker(null)}
            >
              <Text style={styles.clearRouteButtonText}>✕ Clear Route</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.centerButton}
            onPress={centerToCurrentLocation}
          >
            <Text style={styles.centerButtonText}>📍</Text>
          </Pressable>
        </>
      )}
      
        <Pressable style={styles.menuWrapper}>
        <Link href="/explore" style={styles.menuButton}>
          <Image
            style={styles.menuIcon}
            resizeMode="cover"
            source={require("../../assets/images/Menu.png")}
          />
          </Link>
        </Pressable>
      

      <View style={styles.reportRoadObstructionWrapper}>
        <Pressable
          style={styles.reportRoadObstruction}
          onPress={() => {
            const newObstruction: RoadObstruction = {
              id: Date.now(),
              coordinate: { ...currentLocation },
              timestamp: new Date(),
            };
            setRoadObstructions([...roadObstructions, newObstruction]);
          }}
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

        {roadObstructions.length > 0 && (
          <View style={styles.warningNotification}>
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningText}>
                Warning! Road Obstacle Ahead (~100m)
              </Text>
            </View>
            <Pressable
              style={styles.roadClearanceButton}
              onPress={() => {
                const nearbyObstruction = roadObstructions.find(obstruction => {
                  const distance = calculateDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    obstruction.coordinate.latitude,
                    obstruction.coordinate.longitude
                  );
                  return distance <= 0.005; // Changed to 0.005 km = 5m
                });
                if (nearbyObstruction) {
                  setRoadObstructions(roadObstructions.filter(obs => obs.id !== nearbyObstruction.id));
                }
              }}
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
            {markers
              .map(marker => ({
                ...marker,
                distance: calculateDistance(
                  currentLocation.latitude,
                  currentLocation.longitude,
                  marker.coordinate.latitude,
                  marker.coordinate.longitude
                )
              }))
              .sort((a, b) => a.distance - b.distance)
              .map((marker, index) => (
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
                      {`~${marker.distance.toFixed(2)}km`}
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
  menuWrapper: {
    position: "absolute",
    top: 20,
    left: 10,
    padding: 10,
  },
  menuButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuIcon: {
    width: 20,
    height: 20,
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
    height: 300,
    // maxHeight: '60%',
    width: '80%',
    alignSelf: 'center',
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
    width: "100%",
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
    top: 100,
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
  markerContainer: {
    width: 30,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  currentLocationPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
  pinTail: {
    width: 2,
    height: 10,
    backgroundColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  devicePin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
  devicePinTail: {
    width: 2,
    height: 10,
    backgroundColor: '#FF3B30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  obstructionPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
  obstructionPinTail: {
    width: 2,
    height: 10,
    backgroundColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
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
  clearRouteButton: {
    position: 'absolute',
    bottom: 320,  // Position it above the nearby devices view
    left: '50%',
    backgroundColor: '#ff4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#ff2222',
    zIndex: 1000,  // Ensure it stays above other elements
  },
  clearRouteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  clearRouteButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  otherRescuerPin: {
    backgroundColor: '#4CAF50', // Green color for other rescuers
    borderColor: 'white',
  },
  otherRescuerPinTail: {
    backgroundColor: '#4CAF50',
  },
});

export default LocationTrackerMenu;