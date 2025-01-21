import React, { useState } from "react";
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
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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

  // Add console.log to debug markers
  const [markers] = useState(() => {
    const unsortedMarkers = generateDohaMarkers();
    console.log('Generated markers:', unsortedMarkers); // Debug log
    return unsortedMarkers.sort((a, b) => {
      const distA = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        a.coordinate.latitude,
        a.coordinate.longitude
      );
      const distB = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        b.coordinate.latitude,
        b.coordinate.longitude
      );
      return distA - distB;
    });
  });

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
});

export default LocationTrackerMenu;




// import { Image, StyleSheet, Platform } from 'react-native';

// import { HelloWave } from '@/components/HelloWave';
// import ParallaxScrollView from '@/components/ParallaxScrollView';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';

// export default function HomeScreen() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
//       headerImage={
//         <Image
//           source={require('@/assets/images/partial-react-logo.png')}
//           style={styles.reactLogo}
//         />
//       }>
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Welcome!</ThemedText>
//         <HelloWave />
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 1: Try it</ThemedText>
//         <ThemedText>
//           Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
//           Press{' '}
//           <ThemedText type="defaultSemiBold">
//             {Platform.select({
//               ios: 'cmd + d',
//               android: 'cmd + m',
//               web: 'F12'
//             })}
//           </ThemedText>{' '}
//           to open developer tools.
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 2: Explore</ThemedText>
//         <ThemedText>
//           Tap the Explore tab to learn more about what's included in this starter app.
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
//         <ThemedText>
//           When you're ready, run{' '}
//           <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
//           <ThemedText type="defaultSemiBold">app-example</ThemedText>.
//         </ThemedText>
//       </ThemedView>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
// });
