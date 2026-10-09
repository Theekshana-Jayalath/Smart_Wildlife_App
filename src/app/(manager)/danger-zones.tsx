
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DangerZone, fetchDangerZones, syncDangerZones, LatLng } from '../../services/dangerZoneService';

export default function DangerZonesScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [initialZones, setInitialZones] = useState<DangerZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentZones, setCurrentZones] = useState<LatLng[][]>([]);

  useEffect(() => {
    const loadZones = async () => {
      const zones = await fetchDangerZones();
      setInitialZones(zones);
      setCurrentZones(zones.map(z => z.points));
      setLoading(false);
    };
    loadZones();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await syncDangerZones(currentZones);
      Alert.alert("Success", "Danger Zones have been updated and synced to the database.");
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to save danger zones");
      setSaving(false);
    }
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SYNC_ZONES') {
        setCurrentZones(data.zones);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#d32f2f" />
        <Text style={{marginTop: 10}}>Loading danger zones...</Text>
      </SafeAreaView>
    );
  }

  const initialZonesJson = JSON.stringify(initialZones.map(z => z.points));

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css" />
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js"></script>
        
        <style>body { padding: 0; margin: 0; } html, body, #map { height: 100%; width: 100%; }</style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([6.3750, 81.5140], 14); 
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

            var drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);

            var initialZones = ${initialZonesJson};
            initialZones.forEach(function(points) {
                var latlngs = points.map(function(p) { return [p.lat, p.lng]; });
                var polygon = L.polygon(latlngs, {color: "#d32f2f", weight: 2, fillOpacity: 0.2});
                drawnItems.addLayer(polygon);
            });

            var drawControl = new L.Control.Draw({
                edit: { featureGroup: drawnItems },
                draw: {
                    polygon: { shapeOptions: { color: '#d32f2f', weight: 2, fillOpacity: 0.2 } },
                    polyline: false,
                    rectangle: { shapeOptions: { color: '#d32f2f', weight: 2, fillOpacity: 0.2 } },
                    circle: false, marker: false, circlemarker: false
                }
            });
            map.addControl(drawControl);

            function syncToReact() {
                var zones = [];
                drawnItems.eachLayer(function(layer) {
                    var latlngs;
                    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
                        latlngs = layer.getLatLngs()[0];
                    }
                    if (latlngs) {
                        zones.push(latlngs.map(function(ll) { return {lat: ll.lat, lng: ll.lng}; }));
                    }
                });
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SYNC_ZONES', zones: zones }));
                }
            }

            map.on(L.Draw.Event.CREATED, function (e) {
                drawnItems.addLayer(e.layer);
                syncToReact();
            });
            map.on(L.Draw.Event.EDITED, function (e) { syncToReact(); });
            map.on(L.Draw.Event.DELETED, function (e) { syncToReact(); });
        </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Danger Zones</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#0066CC" />
        <Text style={styles.infoText}>Use the drawing tools on the left of the map to draw new Geofences around villages.</Text>
      </View>

      <View style={styles.mapContainer}>
        <WebView 
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.map}
          scrollEnabled={false}
          onMessage={handleMessage}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Zones to Database</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#ddd' },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3f2fd', padding: 12, margin: 15, borderRadius: 8 },
  infoText: { flex: 1, marginLeft: 10, color: '#0066CC', fontSize: 13 },
  
  mapContainer: { flex: 1, marginHorizontal: 15, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#ccc' },
  map: { flex: 1 },
  
  footer: { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#ddd' },
  saveBtn: { backgroundColor: '#d32f2f', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
