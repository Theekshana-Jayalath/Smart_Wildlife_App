import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { animalPaths, staticAnimals } from '../../utils/dummyData';
import { Ionicons } from '@expo/vector-icons';

export default function TrackingScreen() {
  const { theme } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [step, setStep] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertLocation, setAlertLocation] = useState({ lat: 0, lng: 0 });

  // Function to check if coordinates are inside the Danger Zone
  const checkDangerZone = (lat: number, lng: number) => {
    return (lat >= 6.3750 && lat <= 6.3800 && lng >= 81.5120 && lng <= 81.5160);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((currentStep) => {
        const nextStep = (currentStep + 1) % 10;
        
        const eLat = animalPaths["E-024"][nextStep].lat;
        const eLng = animalPaths["E-024"][nextStep].lng;
        
        const lLat = animalPaths["L-011"][nextStep].lat;
        const lLng = animalPaths["L-011"][nextStep].lng;

        // Check if Elephant entered the Danger Zone!
        if (checkDangerZone(eLat, eLng) && !showAlert) {
          setAlertLocation({ lat: eLat, lng: eLng });
          setShowAlert(true); // Trigger the React Native Pop-up Alert
        }

        const script = `
          if (typeof elephantMarker !== 'undefined') {
              elephantMarker.setLatLng([${eLat}, ${eLng}]);
              leopardMarker.setLatLng([${lLat}, ${lLng}]);
          }
          true;
        `;
        
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(script);
        }

        return nextStep;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Action: Hide alert (Firebase saving temporarily disabled per user request)
  const handleAcknowledge = () => {
    setShowAlert(false); 
    Alert.alert("Team Dispatched", "The nearest ranger has been notified.");
  };
  
  const staticAnimalsScript = staticAnimals.map(animal => `
    var icon = ${animal.type === 'elephant'} ? elephantIcon : leopardIcon;
    var m = L.marker([${animal.lat}, ${animal.lng}], {icon: icon}).bindPopup("<b>${animal.id}</b>");
    markers.addLayer(m);
  `).join('');

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
        
        <style>
            body { padding: 0; margin: 0; }
            html, body, #map { height: 100%; width: 100%; }
            .custom-emoji-icon { background: none; border: none; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([6.3700, 81.5100], 14); 
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            var elephantIcon = L.divIcon({
                html: '<div style="font-size: 35px; line-height: 35px; text-align: center;">🐘</div>',
                className: 'custom-emoji-icon',
                iconSize: [35, 35],
                iconAnchor: [17, 17]
            });

            var leopardIcon = L.divIcon({
                html: '<div style="font-size: 35px; line-height: 35px; text-align: center;">🐆</div>',
                className: 'custom-emoji-icon',
                iconSize: [35, 35],
                iconAnchor: [17, 17]
            });

            var dangerBounds = [[6.3750, 81.5120], [6.3800, 81.5160]];
            L.rectangle(dangerBounds, {color: "#d32f2f", weight: 2, fillOpacity: 0.2}).addTo(map).bindPopup("<b>High Risk Zone (Village)</b>");

            var markers = L.markerClusterGroup({ maxClusterRadius: 40 });
            ${staticAnimalsScript}
            map.addLayer(markers);

            var elephantMarker = L.marker([6.3720, 81.5185], {icon: elephantIcon}).addTo(map).bindPopup("<b>Elephant E-024</b>").openPopup();
            var leopardMarker = L.marker([6.3800, 81.5000], {icon: leopardIcon}).addTo(map).bindPopup("<b>Leopard L-011</b>");
        </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      
      <Modal visible={showAlert} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="warning" size={50} color="#d32f2f" />
            <Text style={styles.modalTitle}>HIGH RISK ALERT!</Text>
            <Text style={styles.modalDesc}>Elephant E-024 has entered the Village Boundary (Danger Zone).</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={handleAcknowledge}>
              <Text style={styles.modalBtnText}>Acknowledge & Dispatch Team</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.container}>
        <View style={[styles.statsContainer, { backgroundColor: theme.background }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>17</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tracked</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: theme.success }]}>16</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Safe</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: showAlert ? theme.danger : theme.textSecondary }]}>
              {showAlert ? '1' : '0'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>High-Risk</Text>
          </View>
        </View>

        <View style={styles.mapContainer}>
          <WebView 
            ref={webViewRef}
            source={{ html: mapHtml }}
            style={styles.map}
            scrollEnabled={false}
          />
        </View>

        <View style={[styles.updatesContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.updatesTitle, { color: theme.textPrimary }]}>Live Simulation (Step: {step}/10)</Text>
          <Text style={[styles.updateText, { color: showAlert ? '#d32f2f' : theme.textSecondary, fontWeight: showAlert ? 'bold' : 'normal' }]}>
            {showAlert ? '🚨 Elephant E-024 entered Village Zone!' : '🐘 Elephant E-024 is moving North-West'}
          </Text>
          <Text style={[styles.updateText, { color: theme.textSecondary }]}>🐆 Leopard L-011 is patrolling East</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, borderBottomWidth: 1, borderColor: '#e0e0e0' },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 2 },
  mapContainer: { flex: 2, width: '100%' },
  map: { flex: 1, width: '100%' },
  updatesContainer: { flex: 1, padding: 15, borderTopWidth: 1, borderColor: '#e0e0e0' },
  updatesTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  updateText: { fontSize: 14, marginBottom: 8 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', padding: 25, borderRadius: 15, alignItems: 'center', width: '80%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#d32f2f', marginTop: 10, marginBottom: 10 },
  modalDesc: { fontSize: 15, textAlign: 'center', color: '#333', marginBottom: 20 },
  modalBtn: { backgroundColor: '#d32f2f', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
