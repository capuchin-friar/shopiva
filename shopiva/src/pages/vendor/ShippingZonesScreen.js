import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { formatNaira } from '../../utils/formatNaira';
import { BRAND, sharedStyles } from './shippingShared';

/** @typedef {{ id: string; name: string; locations: string[]; baseFee: number; discountPercent: number; pinColor: string }} ShippingZone */

/** @type {ShippingZone[]} */
const DEFAULT_ZONES = [
  {
    id: 'lagos',
    name: 'Lagos',
    locations: ['Lagos State'],
    baseFee: 1000,
    discountPercent: 50,
    pinColor: BRAND,
  },
  {
    id: 'other-states',
    name: 'Nigeria (Other States)',
    locations: ['All other states'],
    baseFee: 1500,
    discountPercent: 50,
    pinColor: '#16A34A',
  },
  {
    id: 'abuja',
    name: 'Abuja (FCT)',
    locations: ['FCT Abuja'],
    baseFee: 1200,
    discountPercent: 50,
    pinColor: '#EA580C',
  },
];

/**
 * Screen 3 — list shipping zones with base fee and discount summary.
 */
export default function ShippingZonesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [menuZoneId, setMenuZoneId] = useState(/** @type {string | null} */(null));

  const model = route.params?.model ?? 'multi_item_discount';
  const defaultBaseFee = route.params?.baseFee ?? 1000;
  const defaultDiscount = route.params?.discountPercent ?? 50;

  useFocusEffect(
    useCallback(() => {
      const pending = route.params?.pendingZone;
      if (!pending || typeof pending !== 'object') return;

      setZones((prev) => {
        const idx = prev.findIndex((z) => z.id === pending.id);
        if (idx >= 0) {
          const next = prev.slice();
          next[idx] = { ...prev[idx], ...pending };
          return next;
        }
        return [...prev, pending];
      });

      navigation.setParams({ pendingZone: undefined });
    }, [navigation, route.params?.pendingZone]),
  );

  useEffect(() => {
    if (route.params?.deletedZoneId) {
      setZones((prev) => prev.filter((z) => z.id !== route.params.deletedZoneId));
      navigation.setParams({ deletedZoneId: undefined });
    }
  }, [navigation, route.params?.deletedZoneId]);

  const openAddZone = () => {
    navigation.navigate('shipping-zone-edit', {
      mode: 'add',
      model,
      defaultBaseFee,
      defaultDiscount,
    });
  };

  const openEditZone = (zone) => {
    navigation.navigate('shipping-zone-edit', {
      mode: 'edit',
      zone,
      model,
      defaultBaseFee,
      defaultDiscount,
    });
  };

  const onZoneMenu = (zone) => {
    setMenuZoneId(zone.id);
  };

  const selectedMenuZone = zones.find((z) => z.id === menuZoneId) ?? null;

  return (
    <View style={sharedStyles.screen}>
      <ScrollView
        contentContainerStyle={[
          sharedStyles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={sharedStyles.sectionSubtitle}>
              Manage shipping fees for different locations.
            </Text>
          </View>

        </View>

        {zones.map((zone) => (
          <TouchableOpacity
            key={zone.id}
            activeOpacity={0.9}
            onPress={() => openEditZone(zone)}
            style={sharedStyles.zoneCard}
          >
            <View
              style={[
                sharedStyles.zonePin,
                { backgroundColor: `${zone.pinColor}22` },
              ]}
            >
              <Icon name="location" size={20} color={zone.pinColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={sharedStyles.zoneName}>{zone.name}</Text>
              <Text style={sharedStyles.zoneMeta}>
                Base Fee (1st item): {formatNaira(zone.baseFee)}
              </Text>
              <Text style={sharedStyles.zoneMeta}>
                Discount: {zone.discountPercent}%
              </Text>
            </View>
            <Pressable
              hitSlop={10}
              onPress={(e) => {
                e.stopPropagation?.();
                onZoneMenu(zone);
              }}
              style={{ padding: 4 }}
            >
              <Icon name="ellipsis-vertical" size={20} color="#6B7280" />
            </Pressable>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{
        position: 'absolute',
        bottom: 45,
        right: 22,

      }}>
        <TouchableOpacity
          style={sharedStyles.outlineBtn}
          activeOpacity={0.88}
          onPress={openAddZone}
        >
          <Text style={sharedStyles.outlineBtnText}>+ Add Zone</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={Boolean(selectedMenuZone)}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuZoneId(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setMenuZoneId(null)}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingBottom: insets.bottom + 12,
              paddingTop: 8,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: '#E5E7EB',
                alignSelf: 'center',
                marginBottom: 12,
              }}
            />
            <TouchableOpacity
              style={{ paddingVertical: 16, paddingHorizontal: 24 }}
              onPress={() => {
                const zone = selectedMenuZone;
                setMenuZoneId(null);
                if (zone) openEditZone(zone);
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: TEXT_COLOR }}>
                Edit zone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ paddingVertical: 16, paddingHorizontal: 24 }}
              onPress={() => {
                const zone = selectedMenuZone;
                setMenuZoneId(null);
                if (!zone) return;
                Alert.alert(
                  'Delete zone',
                  `Remove "${zone.name}" from your shipping zones?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        setZones((prev) => prev.filter((z) => z.id !== zone.id));
                      },
                    },
                  ],
                );
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#DC2626' }}>
                Delete zone
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const TEXT_COLOR = '#111111';
