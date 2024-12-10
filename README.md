# App Documentation: Barcode Item Scanner

## Overview

The **Barcode Item Scanner** is a mobile application built using React Native and the Expo framework. It allows users to scan barcodes or manually input SKU or UPC codes to retrieve product information such as description, department, price, and direct links to search for the item on Google Images.

### Features:

- **Barcode Scanning**: Scan UPC or SKU codes using the device's camera.
- **Manual Input**: Enter SKU or UPC codes manually to search for product information.
- **Product Details**: View item description, sub-department, SKU, UPC, and price.
- **Search via Google Images**: Tap on the SKU or UPC to search for product images on Google.
- **Version Information**: Displays the app's current version and updates in the Home screen.

---

## Application Structure

### **/App.js**

This is the entry point for the app. It sets up the navigation between the **Home** screen and the **BarcodeItemScanner** screen using React Navigation's stack navigator.

```javascript
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Home from "./src/screens/Home";
import BarCodeItemScanner from "./src/screens/BarcodeItemScanner";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BarcodeItemScanner"
          component={BarCodeItemScanner}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

- **NavigationContainer**: Wraps the entire app and manages the navigation state.
- **createStackNavigator**: Creates a stack-based navigation flow with two screens: `Home` and `BarcodeItemScanner`.

### **/src/screens/Home.js**

The **Home** screen is the first screen users see. It provides an introduction to the app with the app title, version information, and a button to start scanning barcodes.

```javascript
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Home = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Price Check</Text>
      <MaterialCommunityIcons name="barcode-scan" size={300} color="black" />
      <Text style={styles.title}>App</Text>
      <View style={styles.versionInfo}>
        <Text>version 2.0.0{"\n"}</Text>
        <Text>
          <Text style={styles.boldText}>Here’s an improved version:</Text>
          {"\n"}- You can now click on the UPC and SKU to search directly on Google Images.
          {"\n"}- You can view the sub-department of each item.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("BarcodeItemScanner")}>
        <Text style={styles.textButton}>Start Scanning</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { ... },
  title: { ... },
  versionInfo: { ... },
  boldText: { ... },
  button: { ... },
  textButton: { ... },
});
```

- **useNavigation**: This hook from React Navigation allows the app to navigate between screens.
- **MaterialCommunityIcons**: Displays a large barcode icon.

### **/src/screens/BarcodeItemScanner.js**

This screen handles barcode scanning and manual input of SKU/UPC codes. When a valid barcode or manual entry is detected, it retrieves the corresponding product details from a JSON file and displays the information in a modal.

```javascript
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Modal, Pressable, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Linking, Alert } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import Items from "../items.json";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BarCodeItemScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [results, setResults] = useState({});
  const [manualInput, setManualInput] = useState("");

  // Code for obtaining permission and scanning functionality

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Modal for displaying results */}
      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <Text>Description: {results.Description}</Text>
          <Text>Sub Department: {results["Sub Dep"]}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/search?tbm=isch&q=${results.SKU}`)}>
            <Text>UPC: {results.UPC}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/search?tbm=isch&q=${results.SKU}`)}>
            <Text>SKU: {results.SKU}</Text>
          </TouchableOpacity>
          <Pressable onPress={() => setModalVisible(false)}>
            <Text>Tap to Scan Again</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Manual input field */}
      <View style={styles.manualInput}>
        <TextInput
          placeholder="Enter SKU/UPC"
          value={manualInput}
          onChangeText={setManualInput}
        />
        <MaterialCommunityIcons name="text-search" onPress={handleManualInput} />
      </View>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { ... },
  modalView: { ... },
  manualInput: { ... },
});
```

- **BarCodeScanner**: This Expo component is used to scan barcodes.
- **Items.json**: The app checks scanned/entered data against this local JSON file.
- **Modal**: Displays the product details when a valid barcode or manual entry is found.
- **Manual Input**: Users can enter SKU or UPC codes manually to fetch the item details.

### **/src/items.json**

This JSON file contains the list of items with their properties such as SKU, UPC, description, price, and department information.

---

## Permissions

The app requests permission to access the camera to scan barcodes. This is done using Expo's `BarCodeScanner.requestPermissionsAsync()` method.

---

## Usage

1. **Home Screen**:

   - Users are greeted with the app's logo and version information.
   - A button labeled "Start Scanning" initiates the barcode scanning process.

2. **BarcodeItemScanner**:

   - Users can scan a barcode using the camera or manually input the SKU/UPC code.
   - Product information (description, department, UPC, SKU, and price) is displayed in a modal if the item is found.
   - Users can click on the UPC or SKU to search for images of the item on Google.

3. **Manual Input**:
   - If a user prefers, they can enter SKU or UPC directly via a text input.

---

## Future Improvements

- Add more detailed error handling when an item is not found.
- Implement a database or API backend to retrieve live product data.
- Improve UI responsiveness for manual input and scanner modes.
