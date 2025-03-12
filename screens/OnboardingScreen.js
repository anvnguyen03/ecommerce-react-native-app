import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import img0 from "../assets/Illustration-0.png"
import img1 from "../assets/Illustration-1.png"
import img2 from "../assets/Illustration-2.png"
import img3 from "../assets/Illustration-3.png"
import img4 from "../assets/Illustration-4.png"
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    image: img0,
    title: "Find the item you’ve \nbeen looking for",
    description:
      "Here you’ll see rich varieties of goods, carefully classified for seamless browsing experience.",
  },
  {
    image: img1,
    title: "Get those shopping \nbags filled",
    description:
      "Add any item you want to your cart, or save it on your wishlist, so you don’t miss it in your future purchases.",
  },
  {
    image: img2,
    title: "Fast & secure \npayment",
    description: "There are many payment options available for your ease.",
  },
  {
    image: img3,
    title: "Package tracking",
    description:
      "In particular, Shoplon can pack your orders, and help you seamlessly manage your shipments.",
  },
  {
    image: img4,
    title: "Nearby stores",
    description:
      "Easily track nearby shops, browse through their items and get information about their products.",
  },
];

// Component Dot Indicator
const DotIndicator = ({ isActive }) => (
  <View
    style={[
      styles.dot,
      { backgroundColor: isActive ? "#FEBE10" : "#D0D0D0" },
    ]}
  />
);

// Component Arrow Icon (thay cho SVG trong Flutter)
const ArrowIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

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

  const renderItem = ({ item, index }) => (
    <View style={styles.slide}>
      <View style={styles.spacer} />
      {index % 2 === 1 && (
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      )}
      {index % 2 === 1 && <View style={styles.spacer} />}
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      {index % 2 === 0 && <View style={styles.spacer} />}
      {index % 2 === 0 && (
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      )}
      <View style={styles.spacer} />
    </View>
  );

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.navigate("Login");
    }
  };

  const handleSkip = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <DotIndicator key={index} isActive={index === currentIndex} />
          ))}
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <ArrowIcon />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  spacer: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    color: "#2C3E50",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#7F8C8D",
    paddingHorizontal: 10,
  },
  image: {
    width: 250,
    height: 250,
  },
  skipButton: {
    alignSelf: "flex-end",
    padding: 20,
  },
  skipText: {
    fontSize: 16,
    color: "#7F8C8D",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dotsContainer: {
    flexDirection: "row",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEBE10",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default OnboardingScreen;