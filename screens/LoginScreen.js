import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useContext } from "react";
import { UserType } from "../UserContext";
import { BASE_URL } from "@env" 

const LoginScreen = () => {
  const { setUserId, setToken } = useContext(UserType);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        if (token) {
          navigation.replace("Main");
        }
      } catch (err) {
        console.log("error message", err);
      }
    };
    checkLoginStatus();
  }, []);
  const handleLogin = () => {
    const user = {
      email: email,
      password: password,
    };
    console.log(user)
    console.log('baseurl', BASE_URL)

    axios
      .post(`${BASE_URL}/auth/signin`, user)
      .then((response) => {
        const user = response.data.user;
        const token = response.data.token;
        const refreshToken = response.data.refreshToken;

        AsyncStorage.setItem("userId", user.userId);
        AsyncStorage.setItem("authToken", token);
        AsyncStorage.setItem("refreshToken", refreshToken);

        setUserId(user.userId);
        setToken(token);

        navigation.replace("Main");
      })
      .catch((error) => {
        console.log('error login: ', error);
        Alert.alert(`Login Error", "Invalid Email ${error}`);
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
            Log In
          </Text>
        </View>

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
                borderColor: email.length > 0 ? "#007FFF" : "transparent",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                width: 300
              },
              emailFocused && {
                borderColor: "#007FFF",
                backgroundColor: "#FFFFFF",
                shadowOpacity: 0.2,
                elevation: 3,
              }
            ]}
          >
            <MaterialIcons
              style={{ marginLeft: 12 }}
              name="email"
              size={24}
              color={emailFocused ? "#007FFF" : "gray"}
            />

            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={{
                color: "#333333",
                marginVertical: 10,
                width: 500,
                fontSize: 16,
                flex: 1,
              }}
              placeholder="Email"
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
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
              },
              passwordFocused && {
                borderColor: "#007FFF",
                backgroundColor: "#FFFFFF",
                shadowOpacity: 0.2,
                elevation: 3,
              }
            ]}
          >
            <AntDesign
              name="lock1"
              size={24}
              color={passwordFocused ? "#007FFF" : "gray"}
              style={{ marginLeft: 12 }}
            />
            <TextInput
              style={{
                color: "#333333",
                marginVertical: 10,
                flex: 1,
                fontSize: 16,
              }}
              placeholder="Password"
              placeholderTextColor="#999999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ padding: 8 }}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color={passwordFocused ? "#007FFF" : "gray"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={{ color: "#007FFF", fontWeight: "500" }}>
              Forgot Password
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 50 }} />

        <TouchableHighlight
          onPress={handleLogin}
          underlayColor="#FFA500"
          style={{
            width: 200,
            backgroundColor: "#FEBE10",
            borderRadius: 6,
            marginLeft: "auto",
            marginRight: "auto",
            padding: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5, 
          }}
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
            Login
          </Text>
        </TouchableHighlight>

        <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ color: "gray", fontSize: 16 }}>
            Don't have an account?{" "}
          </Text>
          <TouchableHighlight
            underlayColor="#E0E0E0"
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={{ color: "#007FFF", fontSize: 16, fontWeight: "500" }}>
              Sign Up
            </Text>
          </TouchableHighlight>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
