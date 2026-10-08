import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function TrackingScreen() {
  
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
    <View style={styles.container}>
      {/* 1. Header / Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Tracked</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#2e7d32' }]}>10</Text>
          <Text style={styles.statLabel}>Safe</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#d32f2f' }]}>2</Text>
          <Text style={styles.statLabel}>High-Risk</Text>
        </View>
      </View>

      {/* 2. The Free OpenStreetMap (Leaflet) inside a WebView */}
      <View style={styles.mapContainer}>
        <WebView 
          source={{ html: mapHtml }}
          style={styles.map}
          scrollEnabled={false} // Prevents the webpage itself from scrolling, allowing the map to drag
        />
      </View>

      {/* 3. Recent Updates Section */}
      <View style={styles.updatesContainer}>
        <Text style={styles.updatesTitle}>Recent Updates</Text>
        <Text style={styles.updateText}>🐘 Elephant E-024 moved to North Boundary</Text>
        <Text style={styles.updateText}>🐆 Leopard L-011 is near Farmland!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  updatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  updateText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  }
});
