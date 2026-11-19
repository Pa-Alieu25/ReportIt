import { useRouter } from 'expo-router';
import { onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

import { Icon } from '@/components/ui/Icon';
import { InlineMessage } from '@/components/ui/InlineMessage';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { GAMBIA_BOUNDS, GAMBIA_MAX_BOUNDS, GREATER_BANJUL_BOUNDS, isInGambia } from '@/constants/geo';
import { ALL_STATUSES } from '@/constants/status';
import { reportsCollection } from '@/lib/firestore';
import { colors, radius, shadows, statusColors } from '@/theme';
import type { Report } from '@/types/models';

type MapReport = {
  id: string;
  title: string;
  category: string;
  status: string;
  place: string | null;
  location: { lat: number; lng: number };
};

// Firestore document ids are short alphanumeric strings; anything else
// coming back from the WebView is ignored.
const REPORT_ID = /^[A-Za-z0-9_-]{1,64}$/;

const statusMap = (pick: 'solid' | 'bg' | 'fg') =>
  JSON.stringify(Object.fromEntries(ALL_STATUSES.map((s) => [s, statusColors(s)[pick]])));

// Leaflet + OpenStreetMap inside a WebView: no native map module or API key,
// and it runs in Expo Go. Report data is never spliced into this HTML; it is
// pushed in with injectJavaScript as JSON, and popup text is escaped.
const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: ${colors.surface.muted}; }
    body { font-family: -apple-system, Roboto, sans-serif; }
    .leaflet-popup-content-wrapper { border-radius: 14px; }
    .leaflet-popup-content { margin: 12px 14px; }
    .rp { min-width: 180px; cursor: pointer; }
    .rp-title { font-weight: 600; font-size: 15px; color: ${colors.text.primary}; margin-bottom: 2px; }
    .rp-meta { font-size: 12px; color: ${colors.text.muted}; margin-bottom: 6px; }
    .rp-status { display: inline-block; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
    .rp-btn { display: block; width: 100%; margin-top: 10px; min-height: 40px; border: 0; border-radius: 10px;
      background: ${colors.brand.teal600}; color: #fff; font-size: 14px; font-weight: 600; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var GAMBIA = ${JSON.stringify(GAMBIA_BOUNDS)};
    var MAX_BOUNDS = ${JSON.stringify(GAMBIA_MAX_BOUNDS)};
    var GREATER_BANJUL = ${JSON.stringify(GREATER_BANJUL_BOUNDS)};
    var STATUS_COLORS = ${statusMap('solid')};
    var STATUS_BG = ${statusMap('bg')};
    var STATUS_FG = ${statusMap('fg')};
    var DEFAULT_COLOR = '#6B7280';

    function post(message) {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }

    var map = L.map('map', {
      zoomControl: false,
      maxBounds: MAX_BOUNDS,
      maxBoundsViscosity: 1.0
    });
    L.control.zoom({ position: 'topright' }).addTo(map);
    map.fitBounds(GREATER_BANJUL);
    // Never zoom out further than the whole country.
    map.setMinZoom(map.getBoundsZoom(GAMBIA));

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var markersLayer = L.layerGroup().addTo(map);

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function makeIcon(color) {
      return L.divIcon({
        className: '',
        html: '<div style="background:' + color + ';width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10]
      });
    }

    function popupContent(report) {
      var el = document.createElement('div');
      el.className = 'rp';
      el.innerHTML =
        '<div class="rp-title">' + escapeHtml(report.title || 'Untitled report') + '</div>' +
        '<div class="rp-meta">' + escapeHtml(report.category || '') +
          (report.place ? ' · ' + escapeHtml(report.place) : '') + '</div>' +
        '<span class="rp-status" style="background:' + (STATUS_BG[report.status] || '#eee') +
          ';color:' + (STATUS_FG[report.status] || '#333') + '">' + escapeHtml(report.status || '') + '</span>' +
        '<button class="rp-btn" type="button">View report</button>';
      // The id stays in this closure; it never goes through HTML.
      el.addEventListener('click', function () { post({ type: 'open', id: report.id }); });
      return el;
    }

    // Replaces the pins without moving the view, so live updates never
    // pull the map away from where the user is looking.
    window.setReports = function (reports) {
      markersLayer.clearLayers();
      (reports || []).forEach(function (report) {
        if (!report || !report.location) return;
        var lat = report.location.lat, lng = report.location.lng;
        if (typeof lat !== 'number' || typeof lng !== 'number' || !isFinite(lat) || !isFinite(lng)) return;
        var color = STATUS_COLORS[report.status] || DEFAULT_COLOR;
        L.marker([lat, lng], { icon: makeIcon(color), title: report.title || 'Report' })
          .bindPopup(popupContent(report))
          .addTo(markersLayer);
      });
    };

    window.resetView = function () {
      map.closePopup();
      map.flyToBounds(GREATER_BANJUL, { duration: 0.6 });
    };

    // The WebView can report a stale size while the native layout settles.
    setTimeout(function () {
      map.invalidateSize();
      map.fitBounds(GREATER_BANJUL);
      map.setMinZoom(map.getBoundsZoom(GAMBIA));
    }, 250);

    post({ type: 'ready' });
  </script>
</body>
</html>
`;

export default function MapScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      reportsCollection,
      (snapshot) => {
        setReports(snapshot.docs.map((doc) => doc.data()));
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load reports for map:', err);
        setError("We couldn't load reports for the map. Check your connection and try again.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // Only reports with valid coordinates inside The Gambia are pinned.
  const pins = useMemo<MapReport[]>(
    () =>
      reports
        .filter(
          (report): report is Report & { location: { lat: number; lng: number } } =>
            !!report.location && isInGambia(report.location.lat, report.location.lng)
        )
        .map((report) => ({
          id: report.id,
          title: report.title,
          category: report.category,
          status: report.status,
          place: report.area ?? report.address,
          location: report.location,
        })),
    [reports]
  );

  useEffect(() => {
    // Wait for both the map and Firestore's first answer, so an empty list
    // is never pushed before the real data arrives.
    if (!mapReady || loading) return;
    webViewRef.current?.injectJavaScript(`window.setReports(${JSON.stringify(pins)}); true;`);
  }, [mapReady, loading, pins]);

  const handleMessage = (event: WebViewMessageEvent) => {
    let message: { type?: string; id?: unknown };
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (message.type === 'ready') setMapReady(true);
    if (message.type === 'open' && typeof message.id === 'string' && REPORT_ID.test(message.id)) {
      router.push(`/report/${message.id}`);
    }
  };

  const subtitle = loading
    ? 'Loading reports…'
    : `${pins.length} report${pins.length === 1 ? '' : 's'} across The Gambia`;

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.surface.background }}>
      <ScreenHeader title="Map" subtitle={subtitle} />
      <OfflineBanner />

      <View className="flex-1">
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: LEAFLET_HTML }}
          onMessage={handleMessage}
          style={{ flex: 1, backgroundColor: colors.surface.muted }}
          accessibilityLabel="Map of reported problems"
        />

        {loading ? (
          <View
            className="absolute inset-0 items-center justify-center"
            style={{ backgroundColor: 'rgba(245,247,244,0.75)' }}>
            <ActivityIndicator size="large" color={colors.brand.teal600} />
          </View>
        ) : null}

        {error ? (
          <View className="absolute inset-x-4 top-16">
            <InlineMessage tone="error" message={error} />
          </View>
        ) : null}

        <Pressable
          onPress={() => webViewRef.current?.injectJavaScript('window.resetView(); true;')}
          accessibilityRole="button"
          accessibilityLabel="Show Greater Banjul"
          className="absolute items-center justify-center"
          style={({ pressed }) => ({
            left: 16,
            top: 16,
            width: 44,
            height: 44,
            borderRadius: radius.md,
            backgroundColor: pressed ? colors.surface.muted : colors.surface.card,
            ...shadows.card,
          })}>
          <Icon name="locate" size={22} color={colors.brand.teal600} />
        </Pressable>

        <View
          className="absolute bottom-4 left-4 p-3"
          accessible
          accessibilityLabel="Legend: pin colours show report status"
          style={{ backgroundColor: colors.surface.card, borderRadius: radius.md, ...shadows.card }}>
          {ALL_STATUSES.map((status) => (
            <View key={status} className="flex-row items-center py-0.5">
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  marginRight: 8,
                  backgroundColor: statusColors(status).solid,
                }}
              />
              <Text variant="caption" color="secondary">
                {status}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
