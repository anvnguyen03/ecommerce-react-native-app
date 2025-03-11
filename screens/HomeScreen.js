import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign, Feather } from "@expo/vector-icons";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import banner1 from "../assets/banner_1.jpg";
import banner2 from "../assets/banner_2.jpg";
import banner3 from "../assets/banner_3.webp";
import allicon from "../assets/all_icon.png"
import axios from "axios";
import ProductItem from "../components/ProductItem";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "../UserContext";
import Carousel from "react-native-reanimated-carousel";
import { BASE_URL } from "@env"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const HomeScreen = () => {
  const { width: screenWidth } = Dimensions.get('window');

  const sampleAddresses = [
    {
      id: "1",
      name: "John Doe",
      houseNo: "123",
      landmark: "Near Park",
      street: "MG Road",
    },
    {
      id: "2",
      name: "Alice Smith",
      houseNo: "456",
      landmark: "Opposite Mall",
      street: "Brigade Road",
    },
    {
      id: "3",
      name: "Bob Johnson",
      houseNo: "789",
      landmark: "Next to Hospital",
      street: "Residency Road",
    },
  ];

  const navigation = useNavigation();

  const [products, setProducts] = useState([]); // Danh sách sản phẩm đang hiển thị
  const [lastProducts, setLastProducts] = useState([]);
  const [page, setPage] = useState(1); // Trang hiện tại
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openSort, setOpenSort] = useState(false);
  const [sortValue, setSortValue] = useState(null);
  const [sortOptions, setSortOptions] = useState([
    {
      label: "Giá tăng dần",
      value: "price_low",
      icon: () => <Ionicons name="arrow-up" size={20} color="black" />,
    },
    {
      label: "Giá giảm dần",
      value: "price_high",
      icon: () => <Ionicons name="arrow-down" size={20} color="black" />,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const { userId, setUserId, token, setToken, refreshToken, setRefreshToken } = useContext(UserType);
  const [selectedAddress, setSelectedAdress] = useState("");

  // fetch all products
  const fetchProducts = useCallback(async (currentPage) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}/product/getall/${currentPage}`);

      const newProducts = response.data.products || []

      if (newProducts.length === 0) {
        setHasMore(false); // Hết dữ liệu
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
        setPage((prev) => prev + 1); // Tăng page lên
      }
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // Fetch product by category
  const fetchProductsByCategory = useCallback(async (categoryId, currentPage) => {
    if (loading || !hasMore) return;
    setLoading(true)

    try {
      const url = `${BASE_URL}/product/category/${categoryId}/${currentPage}`
      const response = await axios.get(url);
      const newProducts = response.data.products || [];
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => (currentPage === 1 ? newProducts : [...prev, ...newProducts]));
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchProducts]);

  // Fetch sorted products
  const fetchProductSort = useCallback(async (value) => {
    if (!value) return; // Nếu chưa chọn giá trị sort thì không gọi API
    setLoading(true);
    setProducts([]);
    setPage(1);
    setHasMore(false);

    const order = value === "price_high" ? "desc" : "asc";
    try {
      const response = await axios.get(
        `${BASE_URL}/product/sort/${order}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const sortedProducts = response.data || []
      setProducts(sortedProducts);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm theo sort:", error);
    } finally {
      setLoading(false);
    }
  });

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/category/getall`);
        const allCategories = response.data || [];
        setCategories(allCategories);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch last 10 products
  useEffect(() => {
    const fetchLast10Products = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/product/last-10`);
        const products = response.data || [];
        setLastProducts(products);
      } catch (error) {
        console.error("Lỗi khi lấy 10 sản phẩm mới nhất:", error);
      }
    };
    fetchLast10Products();
  }, []);

  useEffect(() => {
    console.log("useEffect triggered with selectedCategory:", selectedCategory, "page:", page);
    if (sortValue) {
      fetchProductSort(sortValue);
    } else if (selectedCategory === "All") {
      fetchProducts(1);
    } else {
      fetchProductsByCategory(selectedCategory, 1);
    }
  }, [selectedCategory, sortValue]);

  const cart = useSelector((state) => state.cart.cart);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch Address
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        // const response = await axios.get(
        //   `http://localhost:8000/addresses/${userId}`
        // );
        // const { addresses } = response.data;

        setAddresses(sampleAddresses);
      } catch (error) {
        console.log("error", error);
      }
    };

    if (userId) {
      fetchAddresses();
    }
  }, [userId, modalVisible]);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedToken = await AsyncStorage.getItem("authToken");
        const storedRefreshToken = await AsyncStorage.getItem("refreshToken");

        if (storedUserId) setUserId(storedUserId);
        if (storedToken) setToken(storedToken);
        if (storedRefreshToken) setRefreshToken(storedRefreshToken);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ AsyncStorage:", error);
      }
    };

    fetchUser();
  }, []);

  const banners = [
    {
      id: 1,
      image: banner1,
      title: '50-40% OFF',
      subtitle: 'New in splendid! All colours.',
      buttonText: 'Shop Now →'
    },
    {
      id: 2,
      image: banner2,
      title: 'Exclusive Collection',
      subtitle: 'Fresh Summer Sale!',
      buttonText: 'Explore →'
    },
    {
      id: 3,
      image: banner3,
      title: '',
      subtitle: '',
      buttonText: 'Discover →'
    }
  ];

  const renderBannerItem = ({ item }) => {
    return (
      <View style={{ position: "relative", overflow: "hidden", borderRadius: 12 }}>
        <Image source={item.image} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
        <View style={{ position: 'absolute', top: 0, left: 0, padding: 16, width: '100%', height: '100%', justifyContent: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>{item.title}</Text>
          <Text style={{ fontSize: 16, marginBottom: 12 }}>{item.subtitle}</Text>
          <TouchableOpacity style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start" }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>{item.buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleSelectCategory = async (categoryId) => {
    setSortValue(null);
    setProducts([]);
    setHasMore(true)
    setPage(1);
    setSelectedCategory(categoryId);
  };

  const renderHeader = () => (
    <SafeAreaView>

      {/* Header with Search and Avatar */}
      <View
        style={{
          backgroundColor: "#FEBE10",
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 35,
          height: 100
        }}
      >
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 7,
            gap: 10,
            backgroundColor: "white",
            borderRadius: 3,
            height: 38,
            flex: 1,
          }}
        >
          <AntDesign
            style={{ paddingLeft: 10 }}
            name="search1"
            size={22}
            color="black"
          />
          <TextInput placeholder="Search Funiture.ute" />
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Profile")}>
          <Image
            source={{ uri: "https://img.freepik.com/premium-vector/avatar-profile-vector-illustrations-website-social-networks-user-profile-icon_495897-224.jpg" }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 50,
              // marginBottom: 25,
            }}
          />
        </Pressable>
      </View>

      <View style={{ marginVertical: 15, alignItems: "center" }}>
        <Carousel
          loop
          width={screenWidth - 32}
          height={180}
          autoPlay={true}
          data={banners}
          scrollAnimationDuration={1000}
          autoPlayInterval={3000}
          renderItem={renderBannerItem}
          onSnapToItem={(index) => setActiveSlide(index)}
        />
      </View>

      {/* All Featured */}
      <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginVertical: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '500', color: "#333 " }}>All Featured</Text>
        {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: 'center', marginRight: 12, backgroundColor: "#FFFFFF", borderRadius: 6, padding: 4 }}>
            <Text style={{ fontSize: 18, marginRight: 4, color: '#333' }}>Sort</Text>
            <FontAwesome name="sort" size={16} color="black" />
          </TouchableOpacity>
        </View> */}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* All category button */}
        <Pressable
          style={{
            margin: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => handleSelectCategory("All")}
        >
          <View
            style={{
              borderWidth: selectedCategory === "All" ? 2 : 0,
              borderColor: selectedCategory === "All" ? "#FEBE10" : "transparent",
              borderRadius: 27, // Thêm một chút để chứa cả viền và hình ảnh
              padding: 2,
            }}
          >
            <Image
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                resizeMode: "cover",
                overflow: "hidden",
              }}
              source={allicon}
            />
          </View>

          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: selectedCategory === "All" ? "700" : "500",
              marginTop: 5,
              color: selectedCategory === "All" ? "#007BFF" : "black",
            }}
          >
            All
          </Text>
        </Pressable>

        {categories.map((item) => {
          const isSelected = item.id === selectedCategory;
          return (
            <Pressable
              key={`category${item.id}`}
              style={{
                margin: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => handleSelectCategory(item.id)}
            >
              <View
                style={{
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? "#FEBE10" : "transparent",
                  borderRadius: 27, // Thêm một chút để chứa cả viền và hình ảnh
                  padding: 2,
                }}
              >
                <Image
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    resizeMode: "cover",
                    overflow: "hidden",
                  }}
                  source={{ uri: item.image }}
                />
              </View>

              <Text
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: isSelected ? "700" : "500",
                  marginTop: 5,
                  color: isSelected ? "#007BFF" : "black",
                }}
              >
                {item?.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text
        style={{
          height: 1,
          borderColor: "#D0D0D0",
          borderWidth: 2,
          marginTop: 15,
        }}
      />

      {/* 10 new products */}
      <Text style={{ padding: 10, fontSize: 18, fontWeight: "bold" }}>
        Top deals
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 10 }}>
        {lastProducts.map((item, index) => {
          const scale = useSharedValue(1); // Giá trị scale ban đầu

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
          }));

          const onPressIn = () => {
            scale.value = withSpring(1.10); // Phóng to 5% khi nhấn
          };

          const onPressOut = () => {
            scale.value = withSpring(1); // Trở về kích thước ban đầu
          };

          return (
            <TouchableOpacity
              key={`lastproduct${item.id}`}
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
                  stock: item.stoke,
                })
              }
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={0.6}
              style={{ width: 150, marginVertical: 10, marginRight: 15, backgroundColor: "#e8e6e5", borderRadius: 25, alignItems: "center", justifyContent: "center", overflow: "hidden", elevation: 2 }}
            >
              <Animated.View style={[{ position: "relative", width: "100%", height: 150 }, animatedStyle]}>
                <Image
                  style={{ width: "100%", height: "100%", borderRadius: 25, resizeMode: "cover" }}
                  source={{ uri: `data:image/jpeg;base64,${item?.img1}` }}
                />
                {/* Huy hiệu Top Seller */}
                <View style={{ position: "absolute", top: 10, left: 10, backgroundColor: "#E31837", borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8, }}>
                  <Text style={{ color: "#FFF", fontSize: 12, fontWeight: 'bold' }}>#{index + 1}</Text>
                </View>
              </Animated.View>

              {/* Thông tin sản phẩm */}
              <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 5, textAlign: "center", paddingHorizontal: 5 }} numberOfLines={1}>
                  {item?.name}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#E31837", marginBottom: 5 }}>
                  {item?.price.toLocaleString("vi-VN")} đ
                </Text>

              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <Text
        style={{
          height: 1,
          borderColor: "#D0D0D0",
          borderWidth: 2,
          marginTop: 15,
        }}
      />

      {/* Sort */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginHorizontal: 10 }}>
        <View style={{ flexDirection: "row", marginHorizontal: 30, marginTop: 20, width: "30%", gap: 5, alignItems: "center" }}>
          <Text style={{ fontSize: 13, fontWeight: "bold" }}>
            Sort
          </Text>
          <DropDownPicker
            style={{ borderColor: "#B7B7B7", height: 40 }}
            open={openSort}
            value={sortValue}
            items={sortOptions}
            setOpen={setOpenSort}
            setValue={setSortValue}
            placeholder="Sắp xếp"
            placeholderStyle={{ color: "#999" }}
            dropDownDirection="TOP"
            listMode="SCROLLVIEW"
            maxHeight={250}
            showTickIcon={false}
          />
        </View>
      </View>


    </SafeAreaView>
  );
  return (

    <FlatList
      ListHeaderComponent={renderHeader}
      data={products}
      renderItem={({ item }) => (
        <View key={`product${item.id}`} style={{ flex: 1, margin: 5 }}>
          <ProductItem item={item} />
        </View>
      )}

      keyExtractor={(item) => item.id.toString()}
      numColumns={2} // Hiển thị 2 cột trên mỗi hàng
      columnWrapperStyle={{ justifyContent: "space-between" }} // Căn chỉnh khoảng cách giữa các cột
      onEndReached={() => {
        if (selectedCategory === "All") {
          fetchProducts(page);
        } else {
          fetchProductsByCategory(selectedCategory, page);
        }
      }} // Khi cuộn hết danh sách, gọi API lấy thêm dữ liệu
      onEndReachedThreshold={0.5} // Load thêm khi còn 50% danh sách
      ListFooterComponent={
        loading ? <ActivityIndicator size="large" color="blue" /> : null
      } // Hiển thị loading khi tải thêm sản phẩm
      ListEmptyComponent={
        !loading && (
          <View style={{ alignItems: "center", marginVertical: 50 }}>
            <Feather name="shopping-bag" size={50} color="#B7B7B7" />
            <Text style={{ fontSize: 16, color: "#777", marginTop: 10 }}>
              No products available.
            </Text>
          </View>
        )
      } // Hiển thị nếu không có sản phẩm
    />

  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
