import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, PixelRatio, ScrollView, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { InlineMessage } from '@/components/ui/InlineMessage';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Text } from '@/components/ui/Text';
import { CATEGORY_META, CATEGORY_ORDER } from '@/constants/category';
import { GAMBIA_BOUNDS, GAMBIA_MAX_BOUNDS, GREATER_BANJUL_BOUNDS, isInGambia } from '@/constants/geo';
import { ALL_STATUSES } from '@/constants/status';
import { reportsCollection } from '@/lib/firestore';
import { formatRelative } from '@/lib/format';
import { cloudinaryResized } from '@/lib/images';
import { colors, radius, shadows, statusColors } from '@/theme';
import type { Category, Report, Status } from '@/types/models';

type Located = Report & { location: { lat: number; lng: number } };
type PinPayload = { id: string; title: string; status: string; lat: number; lng: number };

// Firestore document ids are short alphanumeric strings; anything else
// coming back from the WebView is ignored.
const REPORT_ID = /^[A-Za-z0-9_-]{1,64}$/;

const STATUS_SOLID = JSON.stringify(Object.fromEntries(ALL_STATUSES.map((s) => [s, statusColors(s).solid])));

// Leaflet + OpenStreetMap inside a WebView: no native map module or API key,
// and it runs in Expo Go. Report data is pushed in as JSON with
// injectJavaScript, never spliced into this HTML. Pin taps are sent back to
// React Native, which shows the bottom card.
const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; background: ${colors.surface.muted}; }</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var GAMBIA = ${JSON.stringify(GAMBIA_BOUNDS)};
    var GREATER_BANJUL = ${JSON.stringify(GREATER_BANJUL_BOUNDS)};
    var STATUS_COLORS = ${STATUS_SOLID};
    var DEFAULT_COLOR = '#6B7280';
    var markers = {};
    var selectedId = null;

    function post(message) {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }

    var map = L.map('map', { zoomControl: false, maxBounds: ${JSON.stringify(GAMBIA_MAX_BOUNDS)}, maxBoundsViscosity: 1.0 });
    map.fitBounds(GREATER_BANJUL);
    map.setMinZoom(map.getBoundsZoom(GAMBIA));
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    var layer = L.layerGroup().addTo(map);

    function icon(color, big) {
      var s = big ? 28 : 18, b = big ? 4 : 3;
      return L.divIcon({
        className: '',
        html: '<div style="background:' + color + ';width:' + s + 'px;height:' + s + 'px;border-radius:50%;border:' + b + 'px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.4);"></div>',
        iconSize: [s, s], iconAnchor: [s / 2, s / 2]
      });
    }

    function restyle(id, big) {
      var m = markers[id];
      if (m) { m.setIcon(icon(m.options.pinColor, big)); m.setZIndexOffset(big ? 1000 : 0); }
    }

    window.setReports = function (pins) {
      layer.clearLayers();
      markers = {};
      (pins || []).forEach(function (p) {
        if (typeof p.lat !== 'number' || typeof p.lng !== 'number' || !isFinite(p.lat) || !isFinite(p.lng)) return;
        var color = STATUS_COLORS[p.status] || DEFAULT_COLOR;
        var m = L.marker([p.lat, p.lng], { icon: icon(color, p.id === selectedId), title: p.title || 'Report', pinColor: color });
        // The id stays in this closure; it never goes through HTML.
        m.on('click', function (e) { L.DomEvent.stopPropagation(e); post({ type: 'select', id: p.id }); });
        m.addTo(layer);
        markers[p.id] = m;
      });
    };

    window.selectPin = function (id) {
      if (selectedId) restyle(selectedId, false);
      selectedId = id;
      if (id) {
        restyle(id, true);
        var m = markers[id];
        if (m) map.panTo(m.getLatLng(), { animate: true });
      }
    };

    window.resetView = function () { map.flyToBounds(GREATER_BANJUL, { duration: 0.6 }); };

    map.on('click', function () { post({ type: 'deselect' }); });

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

function SelectedReportCard({
  report,
  onOpen,
  onClose,
}: {
  report: Located;
  onOpen: () => void;
  onClose: () => void;
}) {
  const meta = CATEGORY_META[report.category] ?? CATEGORY_META.Other;
  const thumbPx = Math.round(64 * PixelRatio.get());
  return (
    <Card padding={14} style={shadows.raised}>
      <View className="flex-row">
        {report.imageUrl ? (
          <Image
            source={{ uri: cloudinaryResized(report.imageUrl, thumbPx, thumbPx) }}
            style={{ width: 64, height: 64, borderRadius: radius.md }}
            contentFit="cover"
            cachePolicy="memory-disk"
            accessible={false}
          />
        ) : (
          <View
            className="items-center justify-center"
            style={{ width: 64, height: 64, borderRadius: radius.md, backgroundColor: `${meta.tint}1F` }}>
            <Icon name={meta.icon} size={26} color={meta.tint} />
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text weight="semibold" numberOfLines={2}>
            {report.title}
          </Text>
          <Text variant="caption" color="muted" numberOfLines={1} className="mt-0.5">
            {report.category}
            {report.area ? ` · ${report.area}` : ''}
          </Text>
          <View className="mt-1.5 flex-row items-center justify-between">
            <StatusBadge status={report.status} />
            <Text variant="caption" color="muted">
              {formatRelative(report.createdAt)}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: -8, marginRight: -8 }}>
          <IconButton icon="close" accessibilityLabel="Close" onPress={onClose} color={colors.text.muted} />
        </View>
      </View>
      <Button label="View report" icon="arrow-right" className="mt-3" onPress={onOpen} />
    </Card>
  );
}

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
        setError("We couldn't load reports for the map. Check your connection.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // Only reports with valid coordinates inside The Gambia are shown.
  const visible = useMemo<Located[]>(
    () =>
      reports.filter(
        (report): report is Located =>
          !!report.location &&
          isInGambia(report.location.lat, report.location.lng) &&
          (categoryFilter === 'All' || report.category === categoryFilter) &&
          (statusFilter === 'All' || report.status === statusFilter)
      ),
    [reports, categoryFilter, statusFilter]
  );

  const selected = visible.find((report) => report.id === selectedId) ?? null;

  useEffect(() => {
    // Wait for both the map and Firestore's first answer, so an empty list
    // is never pushed before the real data arrives.
    if (!mapReady || loading) return;
    const pins: PinPayload[] = visible.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      lat: r.location.lat,
      lng: r.location.lng,
    }));
    webViewRef.current?.injectJavaScript(`window.setReports(${JSON.stringify(pins)}); true;`);
  }, [mapReady, loading, visible]);

  useEffect(() => {
    if (!mapReady) return;
    webViewRef.current?.injectJavaScript(`window.selectPin(${JSON.stringify(selected?.id ?? null)}); true;`);
  }, [mapReady, selected?.id]);

  const handleMessage = (event: WebViewMessageEvent) => {
    let message: { type?: string; id?: unknown };
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (message.type === 'ready') setMapReady(true);
    if (message.type === 'deselect') setSelectedId(null);
    if (message.type === 'select' && typeof message.id === 'string' && REPORT_ID.test(message.id)) {
      setSelectedId(message.id);
    }
  };

  const countLabel = loading
    ? 'Loading reports…'
    : `${visible.length} report${visible.length === 1 ? '' : 's'}${categoryFilter !== 'All' || statusFilter !== 'All' ? ' match' : ''}`;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.surface.muted }}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: LEAFLET_HTML }}
        onMessage={handleMessage}
        style={{ flex: 1, backgroundColor: colors.surface.muted }}
        accessibilityLabel="Map of reported problems in The Gambia"
      />

      {/* Floating filters */}
      <View className="absolute inset-x-0" style={{ top: insets.top + 8 }} pointerEvents="box-none">
        <OfflineBanner />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4 py-1.5">
          <Chip floating label="All problems" selected={categoryFilter === 'All'} onPress={() => setCategoryFilter('All')} />
          {CATEGORY_ORDER.map((category) => (
            <Chip floating
              key={category}
              label={CATEGORY_META[category].shortLabel}
              icon={CATEGORY_META[category].icon}
              selected={categoryFilter === category}
              onPress={() => setCategoryFilter(categoryFilter === category ? 'All' : category)}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4 py-1.5">
          <Chip floating label="Any status" selected={statusFilter === 'All'} onPress={() => setStatusFilter('All')} />
          {ALL_STATUSES.map((status) => (
            <Chip floating
              key={status}
              label={status}
              dot={statusColors(status).solid}
              selected={statusFilter === status}
              onPress={() => setStatusFilter(statusFilter === status ? 'All' : status)}
            />
          ))}
        </ScrollView>

        <View className="mt-1 flex-row items-center justify-between px-4" pointerEvents="box-none">
          <View
            className="flex-row items-center px-3 py-1.5"
            style={{ backgroundColor: colors.brand.green800, borderRadius: radius.full }}
            accessibilityLiveRegion="polite">
            {loading ? <ActivityIndicator size="small" color={colors.text.inverse} /> : null}
            <Text variant="caption" weight="semibold" color="inverse" className={loading ? 'ml-2' : ''}>
              {countLabel}
            </Text>
          </View>
          <IconButton
            icon="locate"
            tone="surface"
            accessibilityLabel="Show Greater Banjul"
            onPress={() => webViewRef.current?.injectJavaScript('window.resetView(); true;')}
          />
        </View>

        {error ? (
          <View className="mt-2 px-4">
            <InlineMessage tone="error" message={error} />
          </View>
        ) : null}
      </View>

      {selected ? (
        <Animated.View
          entering={FadeInDown.duration(180)}
          exiting={FadeOutDown.duration(120)}
          className="absolute inset-x-4 bottom-4">
          <SelectedReportCard
            report={selected}
            onClose={() => setSelectedId(null)}
            onOpen={() => router.push(`/report/${selected.id}`)}
          />
        </Animated.View>
      ) : !loading && visible.length === 0 && !error ? (
        <View className="absolute inset-x-4 bottom-4">
          <Card padding={14} style={shadows.raised}>
            <Text weight="semibold">No reports to show here yet</Text>
            <Text variant="caption" color="muted" className="mt-0.5">
              {categoryFilter !== 'All' || statusFilter !== 'All'
                ? 'Try clearing the filters.'
                : 'Reports with a location will appear on the map.'}
            </Text>
          </Card>
        </View>
      ) : null}
    </View>
  );
}
