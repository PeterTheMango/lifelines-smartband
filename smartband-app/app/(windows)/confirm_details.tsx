import * as React from "react";
import { Text, StyleSheet, View, Pressable, TextInput, Image, ScrollView } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';


const ConfirmationScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = React.useState({
    qrCode: "",
    serialNumber: "",
    macAddress: "",
    fullName: "",
    idNumber: "",
    nationality: "",
    gender: "Male",
    dateOfBirth: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    console.log("Form submitted", formData);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.confirmationScreen}>
      {/* <Link href="/">
        <Pressable>
          <Image style={styles.closeIcon} resizeMode="cover" source={require("../../assets/images/Close.png")} />
        </Pressable>
      </Link> */}
        <Text style={styles.details}>DETAILS</Text>
        <View style={styles.formContainer}>
          {Object.keys(formData).map((key, index) => (
            <View key={index} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
              {key === "gender" ? (
                <Picker
                  selectedValue={formData[key]}
                  style={styles.inputBox}
                  onValueChange={(value) => handleInputChange(key, value)}
                >
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              ) : key === "dateOfBirth" ? (
                <TextInput
                  style={styles.inputBox}
                  placeholder="YYYY-MM-DD"
                  value={formData[key]}
                  onChangeText={(text) => handleInputChange(key, text)}
                  keyboardType="numeric"
                />
              ) : (
                <TextInput
                  style={styles.inputBox}
                  value={formData[key]}
                  onChangeText={(text) => handleInputChange(key, text)}
                />
              )}
            </View>
          ))}
          
          <Pressable style={styles.confirmButton}>
          <Link href="/"  onPress={handleSubmit}>
            <Text style={styles.confirmButtonText}>Confirm Rescued Personnel</Text>
          </Link>
          </Pressable>
          
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  confirmationScreen: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  details: {
    fontSize: 36,
    fontFamily: "Inter-Regular",
    color: "#000",
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: "rgba(169, 172, 169, 0.5)",
    padding: 20,
    borderRadius: 25,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#000",
    marginBottom: 5,
  },
  inputBox: {
    height: 50,
    backgroundColor: "#d9d9d9",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: "rgba(25, 218, 25, 0.65)",
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
    color: "#000",
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
