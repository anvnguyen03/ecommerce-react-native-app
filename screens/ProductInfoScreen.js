import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ImageBackground,
  Dimensions,
  Image,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/CartReducer";
import { LinearGradient } from "expo-linear-gradient";
import Carousel from "react-native-reanimated-carousel";
import { SearchBar } from "./HomeScreen";
import { BASE_URL } from "@env";
import axios from "axios";
import { UserType } from "../UserContext";

const ProductInfoScreen = () => {
  const route = useRoute();
  const { width } = Dimensions.get("window");
  const navigation = useNavigation();
  const [addedToCart, setAddedToCart] = useState(false);
  const height = width;
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [reviews, setReviews] = useState([]);
  const {token} = useContext(UserType)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/review/${route.params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(response.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy review:", error);
      }
    };
    fetchReviews();
  }, [route.params.id])

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const addItemToCart = (item) => {
    setAddedToCart(true);
    dispatch(addToCart(item));
    setTimeout(() => {
      setAddedToCart(false);
    }, 6000);
  };

  const cart = useSelector((state) => state.cart.cart);
  console.log(cart);

  // Danh sách ảnh sản phẩm
  const images = [route.params.img1, route.params.img2, route.params.img3].filter(Boolean);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Search Bar */}
      <LinearGradient
        colors={["#FEBE10", "#F7A008"]}
        style={styles.header}
      >
        <View style={styles.searchBarContainer}>
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            searchQuery={searchQuery}
          />
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Product Images Carousel */}
      <View style={styles.imageContainer}>
        {images.length > 0 ? (
          <Carousel
            loop
            width={width}
            height={height}
            autoPlay={true}
            data={images}
            scrollAnimationDuration={1000}
            autoPlayInterval={3000}
            renderItem={({ item }) => (
              <ImageBackground
                source={{ uri: `data:image/jpeg;base64,${item}` }}
                style={styles.productImage}
                resizeMode="contain"
              >
                <View style={styles.imageOverlay}></View>
              </ImageBackground>
            )}
          />
        ) : (
          <Text style={styles.noImageText}>Không có ảnh sản phẩm</Text>
        )}
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{route?.params?.name}</Text>
        <Text style={styles.productPrice}>
          {route?.params?.price.toLocaleString("vi-VN")} đ
        </Text>

        {/* Stock and Status */}
        <View style={styles.stockContainer}>
          <Text
            style={[
              styles.stockText,
              { color: route?.params?.stoke > 0 ? "#2ECC71" : "#E74C3C" },
            ]}
          >
            {route?.params?.stoke > 0 ? "Còn hàng" : "Hết hàng"}
          </Text>
          <Text style={styles.stockCount}>
            Số lượng: {route?.params?.stoke}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.descriptionText}>
            {route?.params?.description || "Không có mô tả chi tiết."}
          </Text>
        </View>

        {/* Delivery Info */}
        <View style={styles.deliveryContainer}>
          <Ionicons name="truck" size={20} color="#00CED1" />
          <Text style={styles.deliveryText}>
            Giao hàng MIỄN PHÍ ngày mai trước 15:00. Đặt hàng trong 10 giờ 30 phút.
          </Text>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="#34495E" />
          <Text style={styles.locationText}>
            Giao đến: Sujan - Bangalore 560019
          </Text>
        </View>
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsContainer}>
        <Text style={styles.sectionTitle}>Đánh giá sản phẩm ({reviews.length})</Text>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Ionicons name="person-circle" size={40} color="#7F8C8D" />
                <View style={styles.reviewUserInfo}>
                  <Text style={styles.reviewUser}>User {review.user_id}</Text>
                  <Text style={styles.reviewContent}>{review.content}</Text>
                </View>
              </View>
              {review.img && (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${review.byteImg}` }}
                  style={styles.reviewImage}
                  resizeMode="cover"
                />
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noReviewsText}>Chưa có đánh giá nào.</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => addItemToCart(route?.params)}
          style={({ pressed }) => [
            styles.addToCartButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {addedToCart ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.buyNowButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Mua ngay</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    paddingTop: 35,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginLeft: 10,
  },
  imageContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  noImageText: {
    textAlign: "center",
    padding: 20,
    fontSize: 16,
    color: "#7F8C8D",
  },
  detailsContainer: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    margin: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: "600",
    color: "#E74C3C",
    marginBottom: 10,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  stockText: {
    fontSize: 16,
    fontWeight: "500",
  },
  stockCount: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  descriptionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34495E",
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
  },
  deliveryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  deliveryText: {
    fontSize: 14,
    color: "#00CED1",
    marginLeft: 5,
    flex: 1,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#34495E",
    marginLeft: 5,
    flex: 1,
  },
  reviewsContainer: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    margin: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  reviewItem: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewUserInfo: {
    marginLeft: 10,
    flex: 1,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34495E",
  },
  reviewContent: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
  },
  reviewImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
  noReviewsText: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#FFC72C",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginRight: 10,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: "#FFAC1C",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

export default ProductInfoScreen;