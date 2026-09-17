import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";

type Level = "Low" | "Medium" | "High";

function estimateGroundwater(latitude: number, longitude: number): Level {
  // Demo estimation logic only.
  // Replace this with verified hydrogeological/ERT/data-driven logic
  // before using the result for real drilling decisions.
  const value = Math.abs(Math.sin(latitude * 12.9898 + longitude * 78.233)) % 1;
  if (value < 0.33) return "Low";
  if (value < 0.66) return "Medium";
  return "High";
}

export default function Home() {
  const [region, setRegion] = useState<Region | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    locate();
  }, []);

  async function locate() {
    try {
      setLoading(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "Please allow location permission to use the groundwater estimator."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLevel(null);
    } catch (error) {
      Alert.alert("Location error", "Could not get your current location.");
    } finally {
      setLoading(false);
    }
  }

  function estimate() {
    if (!region) return;
    setLevel(estimateGroundwater(region.latitude, region.longitude));
  }

  function selectPoint(event: any) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setRegion({
      latitude,
      longitude,
      latitudeDelta: region?.latitudeDelta ?? 0.01,
      longitudeDelta: region?.longitudeDelta ?? 0.01,
    });
    setLevel(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Water Dhaanvik</Text>
        <Text style={styles.subtitle}>Groundwater Availability Estimator</Text>
      </View>

      <View style={styles.mapCard}>
        {region ? (
          <MapView
            style={styles.map}
            initialRegion={region}
            region={region}
            onPress={selectPoint}
            showsUserLocation
            showsMyLocationButton
          >
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              title="Selected location"
              description="Tap another point on the map to select it"
            />
          </MapView>
        ) : (
          <View style={styles.loading}>
            {loading ? <ActivityIndicator size="large" /> : null}
            <Text style={styles.loadingText}>
              {loading ? "Getting your location..." : "Location unavailable"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.locationTitle}>Selected Location</Text>
        {region ? (
          <Text style={styles.coordinates}>
            {region.latitude.toFixed(6)}, {region.longitude.toFixed(6)}
          </Text>
        ) : (
          <Text style={styles.coordinates}>Waiting for location...</Text>
        )}
      </View>

      <TouchableOpacity style={styles.primary} onPress={estimate} disabled={!region}>
        <Text style={styles.primaryText}>Estimate Groundwater</Text>
      </TouchableOpacity>

      {level && (
        <View style={styles.result}>
          <Text style={styles.resultLabel}>Estimated Groundwater Probability</Text>
          <Text style={styles.resultValue}>{level}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.secondary} onPress={locate}>
        <Text style={styles.secondaryText}>Use My Current Location</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Important: This is an estimate, not a guaranteed water detector.
        Do not make drilling decisions from this result alone. Professional
        hydrogeological investigation and, where appropriate, ERT/survey data
        should be used for field decisions.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6FAFC" },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#073B5C" },
  subtitle: { marginTop: 3, color: "#527080", fontSize: 14 },
  mapCard: {
    marginHorizontal: 14,
    height: 370,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E7EEF2",
  },
  map: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 10, color: "#526A76" },
  info: { paddingHorizontal: 18, paddingTop: 15 },
  locationTitle: { fontSize: 15, fontWeight: "700", color: "#173B4D" },
  coordinates: { marginTop: 5, color: "#607782" },
  primary: {
    margin: 18,
    marginBottom: 10,
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: "center",
    backgroundColor: "#0A79B8",
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  result: {
    marginHorizontal: 18,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#E3F4E8",
    alignItems: "center",
  },
  resultLabel: { color: "#315A3B", fontSize: 13 },
  resultValue: { marginTop: 4, fontSize: 30, fontWeight: "900", color: "#1D6B35" },
  secondary: {
    marginHorizontal: 18,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0A79B8",
    alignItems: "center",
  },
  secondaryText: { color: "#0A679B", fontWeight: "700" },
  disclaimer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: "#687A83",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
