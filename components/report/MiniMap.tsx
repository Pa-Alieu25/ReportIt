import { Linking, View } from 'react-native';
import WebView from 'react-native-webview';

import { Button } from '@/components/ui/Button';
import { colors, radius } from '@/theme';

// Static Leaflet preview of a single location. lat/lng must be finite
// numbers (checked by the caller), so splicing them into the HTML is safe.
function buildHtml(lat: number, lng: number): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>html,body,#map{height:100%;margin:0;padding:0;background:${colors.surface.muted}}.leaflet-control-attribution{font-size:9px}</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map = L.map('map', { zoomControl:false, dragging:false, scrollWheelZoom:false, doubleClickZoom:false,
  boxZoom:false, keyboard:false, tap:false, touchZoom:false }).setView([${lat}, ${lng}], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
L.marker([${lat}, ${lng}], { icon: L.divIcon({ className: '', iconSize: [22, 22], iconAnchor: [11, 11],
  html: '<div style="background:${colors.brand.teal600};width:22px;height:22px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>' }) }).addTo(map);
</script></body></html>`;
}

export function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <View>
      <View
        className="overflow-hidden"
        style={{ height: 180, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default }}
        accessible
        accessibilityLabel="Map showing where the problem is">
        <WebView
          source={{ html: buildHtml(lat, lng) }}
          originWhitelist={['*']}
          scrollEnabled={false}
          pointerEvents="none"
          style={{ flex: 1, backgroundColor: colors.surface.muted }}
        />
      </View>
      <Button
        label="Get directions"
        icon="map"
        variant="ghost"
        className="mt-1"
        onPress={() => void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`)}
      />
    </View>
  );
}
