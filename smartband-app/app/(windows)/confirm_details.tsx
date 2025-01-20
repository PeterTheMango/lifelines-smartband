import * as React from "react";
import { Text, StyleSheet, View, Pressable, Image } from "react-native";

const ConfirmationScreen = () => {
  return (
    <View style={styles.confirmationScreen}>
      <Text style={styles.details}>DETAILS</Text>
      <View style={styles.formContainer}>
        {[
          "QR Code",
          "Serial Number",
          "MAC Address",
          "Full Name",
          "National / Passport ID",
          "Nationality",
          "Gender",
          "Phone Number",
          "Address Line 1",
          "Address Line 2",
        ].map((label, index) => (
          <View key={index} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputBox} />
          </View>
        ))}
        <Pressable
          style={styles.confirmButton}
          onPress={() => {}}
        >
          <Text style={styles.confirmButtonText}>Confirm Rescued Personnel</Text>
        </Pressable>
      </View>
      <Image style={styles.closeIcon} resizeMode="cover" source={require("../../assets/images/Close.png")} />
    </View>
  );
};

const styles = StyleSheet.create({
  confirmationScreen: {
    flex: 1,
    width: "100%",
    height: 852,
    backgroundColor: "#fff",
  },
  details: {
    fontSize: 36,
    fontFamily: "Inter-Regular",
    color: "#000",
    position: "absolute",
    top: 20,
    left: 20,
  },
  formContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -340,
    marginLeft: -150,
    backgroundColor: "rgba(169, 172, 169, 0.5)",
    padding: 50,
    borderRadius: 25,
    alignItems: "center",
    width: 300,
  },
  inputContainer: {
    width: 250,
    paddingVertical: 5,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#000",
    textAlign: "left",
  },
  inputBox: {
    height: 40,
    backgroundColor: "#d9d9d9",
    borderRadius: 5,
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: "rgba(25, 218, 25, 0.65)",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
    color: "#000",
    textAlign: "center",
  },
  closeIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
  },
});

export default ConfirmationScreen;
