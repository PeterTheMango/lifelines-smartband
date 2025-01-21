import React from "react";
import {
  Image,
  StyleSheet,
  Pressable,
  Text,
  View,
  ImageBackground,
} from "react-native";
import { Link } from 'expo-router';
import { Platform } from "react-native";
import MapView from "react-native-maps";
import { WebView } from "react-native-webview";
import { useNavigation } from '@react-navigation/native';


const LocationTrackerMenu = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <WebView
          style={styles.map}
          source={{ uri: "https://www.google.com/maps" }}
        />
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
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
        <View style={styles.reportRoadObstruction}>
          <Text style={styles.reportText}>{`Report Road\nObstruction`}</Text>
        </View>
      </View>

      <View style={styles.warningNotificationContainer}>
        {/* <View style={styles.warningNotification}>
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningText}>
              Warning! Road Obstacle Ahead (~100m)
            </Text>
          </View>
          <View style={styles.roadClearanceButton}>
            <Text style={styles.reportText}>{`Report Road\nClearance`}</Text>
          </View>
        </View> */}

        <View style={styles.nearbyDevices}>
          <View style={styles.nearbyDevicesHeader}>
            <Text style={styles.nearbyDevicesTitle}>Nearby Devices</Text>
          </View>
          {[...Array(3)].map((_, index) => (

            <Pressable key={index} style={styles.deviceItem}>
              <View style={styles.deviceStatusButton}>
                <Link href="/confirm_details">
                  <Text style={styles.rescueText}>{`Mark as\nRescued`}</Text>
                </Link>
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceText}>7f:66:85:47:e6:e2</Text>
                <Text style={styles.distanceText}>~1km</Text>
              </View>
            </Pressable>

          ))}
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
  },
  reportText: {
    textAlign: "center",
    color: "#fff",
    fontFamily: "Inter-Regular",
    fontSize: 12,
  },
  warningNotificationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 20,
  },
  warningNotification: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 15,
    borderRadius: 25,
  },
  warningTextContainer: {
    alignItems: "center",
  },
  warningText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  roadClearanceButton: {
    backgroundColor: "#19da19",
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  nearbyDevices: {
    marginTop: 20,
    backgroundColor: "#bfc3ba",
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
  },
  nearbyDevicesHeader: {
    backgroundColor: "#a9aca9",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
  nearbyDevicesTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    textAlign: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
  },
  deviceText: {
    fontSize: 12,
    color: "#000",
  },
  distanceText: {
    fontSize: 10,
    color: "#000",
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
