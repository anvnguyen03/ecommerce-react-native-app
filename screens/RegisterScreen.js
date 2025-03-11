import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  TouchableHighlight,
} from "react-native";
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "@env"

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigation = useNavigation();
  const handleRegister = () => {
    const user = {
      fullname: name,
      email: email,
      password: password,
    };
    console.log(user, 'resig')

    // send a POST  request to the backend API to register the user
    axios
      .post(`${BASE_URL}/auth/signup`, user)
      .then((response) => {
        console.log(response);
        Alert.alert("Registration successful", "Please verify your email with the OTP sent.");

        // Điều hướng đến màn hình VerifyOTP và truyền email để xác thực OTP
        navigation.navigate("VerifyOTP", { email: email });
      })
      .catch((error) => {
        console.log(error);
        console.log(error.response?.data || error, "erregis");
        Alert.alert("Registration Error", "An error occurred while registering");
      });
  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
    >
      <View style={{ paddingTop: 70 }}>
        <Image
          style={{ width: 150, height: 150 }}
          source={{
            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREIs419BPvSM2Kc_uT6rwWr1RHkeGMxYDS-UL8phGOtk64wrekwAQZta4UReHnCeIyQTE&usqp=CAU",
          }}
        />
      </View>

      <KeyboardAvoidingView>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 20,
              color: "#041E42",
            }}
          >
            Sign Up
          </Text>
        </View>

        {/* Trường Name */}
      <View style={{ marginTop: 20 }}>
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#F0F0F0",
              paddingVertical: 8,
              borderRadius: 8,
              marginTop: 30,
              borderWidth: 1,
              borderColor: name.length > 0 ? "#007FFF" : "transparent",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              width: 300,
            },
            nameFocused && {
              borderColor: "#007FFF",
              backgroundColor: "#FFFFFF",
              shadowOpacity: 0.2,
              elevation: 3,
            },
          ]}
        >
          <Ionicons
            name="person"
            size={24}
            color={nameFocused ? "#007FFF" : "gray"}
            style={{ marginLeft: 12 }}
          />
          <TextInput
            value={name}
            onChangeText={(text) => setName(text)}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            style={{
              color: "#333333",
              marginVertical: 10,
              fontSize: 16,
              flex: 1,
            }}
            placeholder="Enter your name"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Trường Email */}
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#F0F0F0",
              paddingVertical: 8,
              borderRadius: 8,
              marginTop: 30,
              borderWidth: 1,
              borderColor: email.length > 0 ? "#007FFF" : "transparent",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              width: 300,
            },
            emailFocused && {
              borderColor: "#007FFF",
              backgroundColor: "#FFFFFF",
              shadowOpacity: 0.2,
              elevation: 3,
            },
          ]}
        >
          <MaterialIcons
            name="email"
            size={24}
            color={emailFocused ? "#007FFF" : "gray"}
            style={{ marginLeft: 12 }}
          />
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            style={{
              color: "#333333",
              marginVertical: 10,
              fontSize: 16,
              flex: 1,
            }}
            placeholder="Enter your Email"
            placeholderTextColor="#999999"
          />
        </View>
      </View>

      {/* Trường Password */}
      <View>
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#F0F0F0",
              paddingVertical: 8,
              borderRadius: 8,
              marginTop: 30,
              borderWidth: 1,
              borderColor: password.length > 0 ? "#007FFF" : "transparent",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              width: 300,
            },
            passwordFocused && {
              borderColor: "#007FFF",
              backgroundColor: "#FFFFFF",
              shadowOpacity: 0.2,
              elevation: 3,
            },
          ]}
        >
          <AntDesign
            name="lock1"
            size={24}
            color={passwordFocused ? "#007FFF" : "gray"}
            style={{ marginLeft: 12 }}
          />
          <TextInput
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            style={{
              color: "#333333",
              marginVertical: 10,
              fontSize: 16,
              flex: 1,
            }}
            placeholder="Enter your Password"
            placeholderTextColor="#999999"
          />
        </View>
      </View>

        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
        </View>

        <Pressable
          onPress={handleRegister}
          style={({ pressed }) => ({
            width: 200,
            marginTop: 20,
            backgroundColor: pressed ? "#FFA500" : "#FEBE10",
            borderRadius: 6,
            marginLeft: "auto",
            marginRight: "auto",
            padding: 15,
            transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          })}
        >
          <Text
            style={{
              textAlign: "center",
              color: "white",
              fontSize: 18,
              fontWeight: "bold",
              textShadowColor: "rgba(0, 0, 0, 0.2)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            Sign Up
          </Text>
        </Pressable>

        <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ color: "gray", fontSize: 16 }}>
            Already have an account?{" "}
          </Text>
          <TouchableHighlight
            underlayColor="#E0E0E0"
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: "#007FFF", fontSize: 16, fontWeight: "500" }}>
              Log In
            </Text>
          </TouchableHighlight>
        </View>
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({});
