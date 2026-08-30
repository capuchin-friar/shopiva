import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BRAND,
  buildPreviewLines,
  DISCOUNT_OPTIONS,
  formatAmountInput,
  parseAmountInput,
  sharedStyles,
  ShippingPreviewCard,
} from './shippingShared';

/**
 * Screen 2 — configure base fee and discount for multi-item shipping model.
 */
export default function ShippingMultiItemDiscountScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [baseFee, setBaseFee] = useState(route.params?.baseFee ?? 1000);
  const [baseFeeText, setBaseFeeText] = useState(formatAmountInput(route.params?.baseFee ?? 1000));
  const [discountPercent, setDiscountPercent] = useState(route.params?.discountPercent ?? 50);

  const previewLines = useMemo(
    () => buildPreviewLines('multi_item_discount', baseFee, discountPercent),
    [baseFee, discountPercent],
  );

  const onBaseFeeChange = (text) => {
    setBaseFeeText(text);
    setBaseFee(parseAmountInput(text));
  };

  const onSave = () => {
    if (baseFee <= 0) {
      Alert.alert('Base fee required', 'Enter a base shipping fee for the first item.');
      return;
    }

    navigation.navigate('ShippingZones', {
      model: route.params?.model ?? 'multi_item_discount',
      baseFee,
      discountPercent,
    });
  };

  return (
    <View style={sharedStyles.screen}>
      <ScrollView
        contentContainerStyle={[
          sharedStyles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 20, marginTop: 10 }}>
          <Text style={sharedStyles.fieldLabel}>Base Shipping Fee (1st item)</Text>
          <View style={sharedStyles.inputWrap}>
            <Text style={sharedStyles.currencyPrefix}>₦</Text>
            <TextInput
              style={sharedStyles.textInput}
              value={baseFeeText}
              onChangeText={onBaseFeeChange}
              keyboardType="number-pad"
              placeholder="1,000"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <Text style={sharedStyles.fieldHint}>
            Customer pays 100% shipping fee for the first item.
          </Text>
        </View>

        <View style={{ marginBottom: 8 }}>
          <View style={sharedStyles.sectionTitleRow}>
            <Text style={sharedStyles.fieldLabel}>Discount for Additional Items</Text>
            <Pressable
              hitSlop={8}
              onPress={() =>
                Alert.alert(
                  'Additional item discount',
                  'This discount applies from the second item in the cart onward.',
                )
              }
            >
              <Icon name="information-circle-outline" size={18} color={BRAND} />
            </Pressable>
          </View>
          <Dropdown
            data={DISCOUNT_OPTIONS}
            labelField="label"
            valueField="value"
            value={discountPercent}
            onChange={(item) => setDiscountPercent(item.value)}
            style={sharedStyles.dropdown}
            placeholder="Select discount"
            placeholderStyle={sharedStyles.dropdownPlaceholder}
            selectedTextStyle={sharedStyles.dropdownSelected}
            itemTextStyle={{ fontSize: 15, color: '#111111' }}
            renderRightIcon={() => (
              <Icon name="chevron-down" size={18} color="#6B7280" />
            )}
          />
          <Text style={sharedStyles.fieldHint}>Applied from the 2nd item onwards.</Text>
        </View>

        <ShippingPreviewCard title="Preview" lines={previewLines} />
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
        }}
      >
        <TouchableOpacity
          style={sharedStyles.primaryBtn}
          activeOpacity={0.88}
          onPress={onSave}
        >
          <Text style={sharedStyles.primaryBtnText}>Save Model</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
