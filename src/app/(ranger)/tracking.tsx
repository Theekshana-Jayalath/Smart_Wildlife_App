import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export default function TrackingScreen() {
  const { theme } = useTheme();
  
  // We use a custom HTML string to load Leaflet (OpenStreetMap) inside a WebView.
  // This bypasses ALL Google Maps API Key and Billing requirements!
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { padding: 0; margin: 0; }
            html, body, #map { height: 100%; width: 100%; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // 1. Initialize the map centered around Sri Lanka (Yala coordinates)
            var map = L.map('map').setView([6.3720, 81.5185], 13);
            
            // 2. Load the free OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            // 3. Create Custom Icons for Animals
            var elephantIcon = L.icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/1998/1998634.png',
                iconSize: [35, 35]
            });

            var leopardIcon = L.icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/616/616429.png', 
                iconSize: [35, 35]
            });

            // 4. Add the Dummy Markers
            L.marker([6.3720, 81.5185], {icon: elephantIcon}).addTo(map).bindPopup("<b>Elephant E-024</b><br>Safe Zone").openPopup();
            L.marker([6.3800, 81.5000], {icon: leopardIcon}).addTo(map).bindPopup("<b>Leopard L-011</b><br><span style='color:red;'>High Risk Zone!</span>");
        </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* 1. Header / Stats Section */}
        <View style={[styles.statsContainer, { backgroundColor: theme.background }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>12</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tracked</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: theme.success }]}>10</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Safe</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: theme.danger }]}>2</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>High-Risk</Text>
          </View>
        </View>

        {/* 2. The Free OpenStreetMap (Leaflet) inside a WebView */}
        <View style={styles.mapContainer}>
          <WebView 
            source={{ html: mapHtml }}
            style={styles.map}
            scrollEnabled={false}
          />
        </View>

        {/* 3. Recent Updates Section */}
        <View style={[styles.updatesContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.updatesTitle, { color: theme.textPrimary }]}>Recent Updates</Text>
          <Text style={[styles.updateText, { color: theme.textSecondary }]}>🐘 Elephant E-024 moved to North Boundary</Text>
          <Text style={[styles.updateText, { color: theme.textSecondary }]}>🐆 Leopard L-011 is near Farmland!</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  mapContainer: {
    flex: 2, 
    width: '100%',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  updatesContainer: {
    flex: 1,
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  updatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  updateText: {
    fontSize: 14,
    marginBottom: 8,
  }
});
