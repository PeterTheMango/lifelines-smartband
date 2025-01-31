import * as React from "react";
import { Text, StyleSheet, Pressable, View, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';

const Menu = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.menuContainer}>
      <Text style={styles.title}>SMARTBAND</Text>

      <Pressable style={styles.closeIcon}>
        <Link href="/">
          <Image resizeMode="cover" source={require("../../assets/images/Close.png")} />
        </Link>
      </Pressable>

      <View style={styles.menuItems}>
      <Link href="/">
        <Text style={styles.menuText}>Menu</Text>
        </Link>
        <Pressable>
          <Link href="/rescue_history">
            <Text style={styles.menuText}>History</Text>
          </Link>
        </Pressable>
        <Text style={styles.menuText}>Settings</Text>
        <Text style={styles.menuText}>Logout</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 36,
    fontFamily: "Inter-Regular",
    color: "#000",
    textAlign: "left",
    width: 300,
    height: 57,
  },
  menuText: {
    fontSize: 36,
    fontFamily: "Inter-Regular",
    color: "#000",
    textAlign: "left",
    textDecorationLine: "underline",
    width: 200,
    height: 57,
  },
  menuItems: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -189.5,
    marginLeft: -191.5,
    width: 350,
    paddingHorizontal: 50,
    paddingVertical: 80,
    gap: 5,
    overflow: "hidden",
  },
  closeIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    zIndex: 1,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
    height: 852,
    overflow: "hidden",
  },
});

export default Menu;