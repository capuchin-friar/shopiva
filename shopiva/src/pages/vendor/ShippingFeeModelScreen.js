import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BRAND,
  buildPreviewLines,
  sharedStyles,
  SHIPPING_FEE_MODELS,
  ShippingPreviewCard,
} from './shippingShared';

const DEFAULT_BASE_FEE = 1000;
const DEFAULT_DISCOUNT = 50;

/**
 * Screen 1 — choose shipping fee model (per item, flat, or multi-item discount).
 */
export default function ShippingFeeModelScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initialModel = route.params?.model ?? 'multi_item_discount';
  const [selectedModel, setSelectedModel] = useState(initialModel);

  const previewLines = useMemo(
    () => buildPreviewLines(selectedModel, DEFAULT_BASE_FEE, DEFAULT_DISCOUNT),
    [selectedModel],
  );

  const onConfigure = () => {
    if (selectedModel === 'multi_item_discount') {
      navigation.navigate('shipping-discount', {
        model: selectedModel,
        baseFee: route.params?.baseFee ?? DEFAULT_BASE_FEE,
        discountPercent: route.params?.discountPercent ?? DEFAULT_DISCOUNT,
      });
      return;
    }

    navigation.navigate('shipping-zones', {
      model: selectedModel,
      baseFee: route.params?.baseFee ?? DEFAULT_BASE_FEE,
      discountPercent: route.params?.discountPercent ?? DEFAULT_DISCOUNT,
    });
  };

  return (
    <View style={sharedStyles.screen}>
      <ScrollView
        contentContainerStyle={[
          sharedStyles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <Text style={sharedStyles.sectionSubtitle}>
          Choose how you want to charge shipping fees.
          <Pressable
            hitSlop={8}
            onPress={() =>
              Alert.alert(
                'Shipping fee model',
                'Pick how shipping is calculated for orders. You can set different fees per zone afterward.',
              )
            }
          >
            <Icon name="information-circle-outline" size={20} color={BRAND} />
          </Pressable>
        </Text>

        {SHIPPING_FEE_MODELS.map((model) => {
          const selected = selectedModel === model.id;
          return (
            <TouchableOpacity
              key={model.id}
              activeOpacity={0.9}
              onPress={() => setSelectedModel(model.id)}
              style={[
                sharedStyles.modelCard,
                selected && sharedStyles.modelCardSelected,
              ]}
            >
              <View
                style={[
                  sharedStyles.modelIconWrap,
                  selected && sharedStyles.modelIconWrapSelected,
                ]}
              >
                <Icon
                  name={model.icon}
                  size={22}
                  color={selected ? BRAND : '#6B7280'}
                />
              </View>
              <View style={sharedStyles.modelBody}>
                <View style={sharedStyles.modelTitleRow}>
                  <Text style={sharedStyles.modelTitle}>{model.title}</Text>
                  {model.recommended ? (
                    <View style={sharedStyles.recommendedBadge}>
                      <Text style={sharedStyles.recommendedBadgeText}>Recommended</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={sharedStyles.modelDescription}>{model.description}</Text>
              </View>
              <View
                style={[
                  sharedStyles.radioOuter,
                  selected && sharedStyles.radioOuterSelected,
                ]}
              >
                {selected ? <View style={sharedStyles.radioInner} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}

        <ShippingPreviewCard lines={previewLines} />
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: 90,
          paddingHorizontal: 10,
          // paddingVertical: 10
          // 
        }}
      >
        <TouchableOpacity
          style={[sharedStyles.primaryBtn, {marginTop: 0}]}
          activeOpacity={0.88}
          onPress={onConfigure}
        >
          <Text style={sharedStyles.primaryBtnText}>Setup Model</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
