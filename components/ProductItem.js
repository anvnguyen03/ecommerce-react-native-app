import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/CartReducer";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons"; // Thêm icon cho nút

const ProductItem = ({ item }) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const scale = useSharedValue(1); // Giá trị scale cho hiệu ứng

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(1.05); // Phóng to 5% khi nhấn
  };

  const onPressOut = () => {
    scale.value = withSpring(1); // Trở về kích thước ban đầu
  };

  const addItemToCart = (item) => {
    setAddedToCart(true);
    dispatch(addToCart(item));
    setTimeout(() => {
      setAddedToCart(false);
    }, 60000);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        navigation.navigate("Info", {
          id: item.id,
          name: item.name,
          price: item.price,
          img1: item.img1,
          img2: item.img2,
          img3: item.img3,
          description: item.description,
          status: item.status,
          stock: item.stock,
        })
      }
      onPressIn={onPressIn} // Khi nhấn vào
      onPressOut={onPressOut} // Khi thả ra
      activeOpacity={0.9} // Hiệu ứng mờ nhẹ
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Hình ảnh sản phẩm */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{ uri: `data:image/jpeg;base64,${item?.img1}` }}
          />
        </View>

        {/* Thông tin sản phẩm */}
        <View style={styles.infoContainer}>
          <Text numberOfLines={1} style={styles.name}>
            {item?.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₫{item?.price.toLocaleString()}</Text>
          </View>

          <Text
            style={[
              styles.status,
              { color: item?.status === "AVAILABLE" ? "#008000" : "#E31837" },
            ]}
          >
            {item?.status === "AVAILABLE" ? "Còn hàng" : "Hết hàng"}
          </Text>

          {/* Nút thêm vào giỏ hàng */}
          <TouchableOpacity
            onPress={() => addItemToCart(item)}
            style={[
              styles.button,
              { backgroundColor: addedToCart ? "#28A745" : "#FFC72C" },
            ]}
          >
            <Ionicons
              name={addedToCart ? "checkmark-circle" : "cart-outline"}
              size={18}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {addedToCart ? "Đã thêm" : "Thêm vào giỏ"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ProductItem;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10, // Giảm margin để hiển thị nhiều item hơn
    marginVertical: 15,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    elevation: 4, // Bóng đổ cho Android
    shadowColor: "#000", // Bóng đổ cho iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
    width: 160, // Tăng nhẹ để chứa nội dung
  },
  imageContainer: {
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 5,
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  infoContainer: {
    padding: 10,
    alignItems: "center",
  },
  name: {
    width: "100%",
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E31837", // Đỏ nổi bật
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  button: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});