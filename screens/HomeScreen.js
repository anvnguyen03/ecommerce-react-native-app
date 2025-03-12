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

export const SearchBar = ({ onSearch, onClear, searchQuery }) => {
  console.log("Search bar re-rendered")

  const [inputValue, setInputValue] = useState("");

  // Đồng bộ inputValue với searchQuery khi searchQuery thay đổi
  useEffect(() => {
    if (searchQuery) {
      setInputValue(searchQuery);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    onSearch(inputValue);
  };

  const handleClear = () => {
    setInputValue("");
    onClear();
  };

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 7,
      backgroundColor: "white",
      borderRadius: 3,
      height: 38,
      flex: 1,
    }}>
      <TouchableOpacity onPress={handleSearch} style={{ paddingLeft: 10, paddingRight: 5 }}>
        <AntDesign name="search1" size={22} color="black" />
      </TouchableOpacity>
      <TextInput
        placeholder="Search Furniture.ute"
        value={inputValue}
        onChangeText={(text) => setInputValue(text)}
        style={{
          flex: 1,
          fontSize: 16,
          paddingVertical: 0,
        }}
        autoCapitalize="none"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      {inputValue ? (
        <TouchableOpacity onPress={handleClear} style={{ paddingRight: 10 }}>
          <Ionicons name="close-circle" size={20} color="#666" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const BannerCarousel = ({ banners, width }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const renderBannerItem = ({ item }) => (
    <View style={{ position: "relative", overflow: "hidden", borderRadius: 12 }}>
      <Image source={item.image} style={{ width: "100%", height: "100%", borderRadius: 12 }} />
      <View style={{ position: "absolute", top: 0, left: 0, padding: 16, width: "100%", height: "100%", justifyContent: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 4 }}>{item.title}</Text>
        <Text style={{ fontSize: 16, marginBottom: 12 }}>{item.subtitle}</Text>
        <TouchableOpacity style={{ backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start" }}>
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#333" }}>{item.buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ marginVertical: 15, alignItems: "center"}}>
      <Carousel
        loop
        width={width - 32}
        height={180}
        autoPlay={true}
        data={banners}
        scrollAnimationDuration={1000}
        autoPlayInterval={3000}
        renderItem={renderBannerItem}
        onSnapToItem={(index) => setActiveSlide(index)}
      />
    </View>
  );
};

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
    { label: "Giá tăng dần", value: "price_low", icon: () => <Ionicons name="arrow-up" size={20} color="black" /> },
    { label: "Giá giảm dần", value: "price_high", icon: () => <Ionicons name="arrow-down" size={20} color="black" /> }
  ]);
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm chính thức
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
  }, [loading, hasMore]);

  // Fetch product by category with lazy loading
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
  }, [loading, hasMore, fetchProducts]);

  // Fetch search results with lazy loading
  const fetchSearchResults = useCallback(async (query, currentPage) => {
    if (loading || !hasMore || !query) return;
    setLoading(true);

    try {
      const url = `${BASE_URL}/product/search/${query}/${currentPage}`;
      const response = await axios.get(url);
      const newProducts = response.data.products || [];
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => (currentPage === 1 ? newProducts : [...prev, ...newProducts]));
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  // Fetch sorted products
  const fetchProductSort = useCallback((value) => {
    if (!value) return; // Nếu chưa chọn giá trị sort thì không làm gì
    setLoading(true);
  
    const currentProducts = [...products];
  
    const sortedProducts = currentProducts.sort((a, b) => {
      if (value === "price_high") {
        return b.price - a.price; // Giảm dần
      } else {
        return a.price - b.price; // Tăng dần
      }
    });
  
    setProducts(sortedProducts);
    setPage(1);
    setHasMore(false);
  
    setLoading(false);
  }, [products]); // Dependency là products để hàm cập nhật khi products thay đổi

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
    setProducts([]);
    setPage(1);
    setHasMore(true);

    if (sortValue) {
      fetchProductSort(sortValue);
    } else if (searchQuery) {
      fetchSearchResults(searchQuery, 1);
    } else if (selectedCategory === "All") {
      fetchProducts(1);
    } else {
      fetchProductsByCategory(selectedCategory, 1);
    }
  }, [searchQuery, selectedCategory, sortValue]);

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

  const handleSelectCategory = async (categoryId) => {
    setSortValue(null);
    setSearchQuery("");
    setProducts([]);
    setHasMore(true)
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setSelectedCategory("All"); // Reset category khi tìm kiếm
    setSortValue(null);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortValue(null);
  };

  const renderHeader = () => {
    console.log("Header rendered")

    return (
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
          <SearchBar onSearch={handleSearch} onClear={handleClearSearch} searchQuery={searchQuery} />

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

        {/* <View style={{ marginVertical: 15, alignItems: "center" }}>
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
        </View> */}

        <BannerCarousel banners={banners} width={screenWidth} />

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
                    stoke: item.stoke,
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
    )
  };

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
        if (searchQuery) {
          fetchSearchResults(searchQuery, page);
        } else if (selectedCategory === "All") {
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
