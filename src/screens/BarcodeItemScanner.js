import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import Feather from "@expo/vector-icons/Feather";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BarCodeItemScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [results, setResults] = useState({});
  const [manualInput, setManualInput] = useState("");
  const [camera, setCamera] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch items from API with caching
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Try to load from cache first
        const cachedData = await AsyncStorage.getItem("itemsCache");
        if (cachedData) {
          setItems(JSON.parse(cachedData));
          setLoading(false);
        }

        // Always try to update from API in background
        const res = await fetch("https://sheetdb.io/api/v1/pnhhegaw3olc5");
        const data = await res.json();

        if (data.length > 0) {
          setItems(data);
          await AsyncStorage.setItem("itemsCache", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        if (!items.length) {
          Alert.alert("Error", "Failed to load items from API or cache");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const department = (results) => {
    let department = "";
    switch (results) {
      case "500":
        department = "Cleaning";
        break;
      case "110":
        department = "Apparel";
        break;
      case "120":
        department = "Accessories";
        break;
      case "160":
        department = "Cosmetics";
        break;
      case "170":
        department = "HBA";
        break;
      case "210":
        department = "Stationery";
        break;
      case "220":
        department = "Toys";
        break;
      case "260":
        department = "Food";
        break;
      case "310":
        department = "DIY";
        break;
      case "360":
        department = "Storage";
        break;
      case "410":
        department = "Kitchen";
        break;
      case "420":
        department = "Tableware";
        break;
      case "100":
        department = "Apparel & Accessories";
        break;
      case "250":
        department = "Food";
        break;
      case "200":
        department = "General Merchandise";
        break;
      case "300":
        department = "Hardware";
        break;
      case "150":
        department = "Health & Beauty Aids";
        break;
      case "450":
        department = "Interior";
        break;
      case "400":
        department = "Kitchen & Dining";
        break;
      case "550":
        department = "Outdoor";
        break;
      case "350":
        department = "Storage";
        break;
    }
    return department;
  };

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getBarCodeScannerPermissions();
  }, []);

  const searchItem = (code) => {
    const match = items.find((item) => item.SKU === code || item.UPC === code);
    if (match) {
      setModalVisible(true);
      setResults(match);
    } else {
      setModalVisible(false);
    }
  };

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    searchItem(data);
  };

  const handleManualInput = ({ data }) => {
    if (!data) return;
    setScanned(true);
    searchItem(data);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
        <Text style={{ textAlign: "center", fontSize: 24 }}>
          Loading items <ActivityIndicator size="large" />
        </Text>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
        <Text style={{ textAlign: "center", fontSize: 24 }}>
          Requesting for camera permission <ActivityIndicator size="large" />
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 120}
      behavior="padding"
      style={styles.container}
    >
      {camera && (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <Pressable
        onPress={() => setCamera(!camera)}
        style={{ position: "absolute", top: 100, right: 20, zIndex: 1, padding: 10 }}
      >
        {camera ? (
          <Feather name="camera" size={42} color="white" />
        ) : (
          <Feather name="camera-off" size={42} color="white" />
        )}
      </Pressable>

      {scanned && !modalVisible && (
        <View style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 }}>
          <Text style={{ textAlign: "center", fontSize: 20, fontWeight: "bold", color: "#fff" }}>
            <Text style={{ fontSize: 30 }}>⚠️</Text> NO RECORD
          </Text>
        </View>
      )}

      <MaterialCommunityIcons
        style={{ top: -8, left: 1 }}
        name="scan-helper"
        size={300}
        color="#FCC56B"
      />

      {/* Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Description:{"\n"}
              <Text style={styles.modalTextResult}>{results.Description}</Text>
            </Text>
            <Text style={styles.modalText}>
              Department:{"\n"}
              <Text style={styles.modalTextResult}>
                {department(results.Department)}
              </Text>
            </Text>
            <Text style={styles.modalText}>
              Sub Department:{"\n"}
              <Text style={styles.modalTextResult}>
                {department(results["Sub Dep"])}
              </Text>
            </Text>
            <Text style={styles.modalText}>
              UPC:{"\n"}
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`https://www.google.com/search?tbm=isch&q=${results.SKU}`)
                }
              >
                <Text style={styles.modalTextResult}>
                  {results.SKU}{" "}
                  <MaterialCommunityIcons name="image-search-outline" size={24} color="pink" />
                </Text>
              </TouchableOpacity>
            </Text>
            <Text style={styles.modalText}>
              SKU:{"\n"}
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`https://www.google.com/search?tbm=isch&q=${results.UPC}`)
                }
              >
                <Text style={styles.modalTextResult}>
                  {results.UPC}{" "}
                  <MaterialCommunityIcons name="image-search-outline" size={24} color="pink" />
                </Text>
              </TouchableOpacity>
            </Text>
            <Text style={styles.modalText}>
              Price:{"\n"}₱{results.Price}
            </Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setScanned(false);
                setModalVisible(false);
                setResults({});
                setManualInput("");
              }}
            >
              <Text style={styles.textStyle}>Tap to Scan Again</Text>
            </Pressable>
            <Text style={{ fontSize: 12, color: "gray", textAlign: "center" }}>
              Pinag-puyatan by: {"\n"}KYM RHYS MALLARI
            </Text>
          </View>
        </View>
      </Modal>

      {scanned && !modalVisible && (
        <TouchableOpacity
          style={{
            backgroundColor: "#DC143C",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
          }}
          onPress={() => setScanned(false)}
        >
          <Text style={{ textAlign: "center", fontSize: 20, fontWeight: "bold", color: "#fff" }}>
            SCAN/INPUT AGAIN
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.manualInput}>
        <TextInput
          style={{ fontSize: 24, width: "90%" }}
          placeholder="SKU or UPC"
          value={manualInput}
          onChangeText={setManualInput}
          keyboardType="numeric"
          maxLength={13}
          onBlur={() => handleManualInput({ data: manualInput })}
        />
        <MaterialCommunityIcons
          onPress={() => handleManualInput({ data: manualInput })}
          name="text-search"
          size={24}
          color="red"
        />
      </View>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#252525",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "#252525",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "#F4F3F2",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 20,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    color: "#CCCCCC",
  },
  modalTextResult: {
    fontWeight: "bold",
    color: "#F4F3F2",
    fontSize: 25,
  },
  manualInput: {
    position: "static",
    borderWidth: 1,
    borderColor: "#252525",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    bottom: -100,
    width: "90%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});