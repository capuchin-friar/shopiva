import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Create product flow (nested under Products tab stack).
 */
export default function VendorCreateProductScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [productType, setProductType] = useState('');
  const [variantColor, setVariantColor] = useState('');
  const [variantSize, setVariantSize] = useState('');
  const [variantMaterial, setVariantMaterial] = useState('');
  const [variantStock, setVariantStock] = useState('');
  const [variantPrice, setVariantPrice] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [continueSelling, setContinueSelling] = useState(false);
  const [fragile, setFragile] = useState(false);
  const [weightKg, setWeightKg] = useState('0');
  const [lengthCm, setLengthCm] = useState('0');
  const [widthCm, setWidthCm] = useState('0');
  const [heightCm, setHeightCm] = useState('0');
  const [brandName, setBrandName] = useState('');
  const [allowPickup, setAllowPickup] = useState(false);
  const [allowDelivery, setAllowDelivery] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showFinishSheet, setShowFinishSheet] = useState(false);

  const hasVariantOptions = useMemo(
    () =>
      [variantColor, variantSize, variantMaterial]
        .map((v) => v.trim())
        .some(Boolean),
    [variantColor, variantSize, variantMaterial],
  );

  const isPriceValid = Number(price) > 0;
  const isQuantityValid = Number(quantity) > 0;
  const hasCoreFields =
    title.trim().length > 1 &&
    category.trim().length > 0 &&
    isPriceValid &&
    isQuantityValid;
  const hasCategoryFields = subCategory.trim().length > 0 && productType.trim().length > 0;

  const onSave = useCallback(() => {
    if (!hasCoreFields || !hasCategoryFields) {
      setShowValidationModal(true);
      return;
    }
    setShowFinishSheet(true);
  }, [hasCategoryFields, hasCoreFields]);

  const onContinueFinalSave = useCallback(() => {
    setShowFinishSheet(false);
    // Final API hook point for product create.
  }, []);

  return (
    <View style={[styles.root, { paddingTop: 0 }]}>
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backHit}
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Icon name="chevron-back" size={26} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.title}>New product</Text>
        <View style={styles.headerSpacer} />
      </View> */}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.label}>Product title</Text>
          <TextInput
            style={styles.input}
            placeholder="Product Title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, styles.spaceTop]}>Product description</Text>
          <View style={styles.toolbarRow}>
            <Icon name="text" size={18} color="#111111" />
            <Icon name="text-outline" size={18} color="#111111" />
            <Icon name="remove-outline" size={18} color="#111111" />
            <Icon name="arrow-undo-outline" size={18} color="#111111" />
            <Icon name="arrow-redo-outline" size={18} color="#111111" />
          </View>
          <TextInput
            style={styles.descriptionInput}
            multiline
            textAlignVertical="top"
            placeholder=""
            value={description}
            onChangeText={setDescription}
          />

          <Text style={[styles.label, styles.spaceTop]}>Media</Text>
          <View style={styles.mediaBox}>
            <View style={styles.mediaBtnsRow}>
              <TouchableOpacity style={styles.mediaBtnActive} activeOpacity={0.88}>
                <Text style={styles.mediaBtnActiveText}>Upload new</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaBtnGhost} activeOpacity={0.88}>
                <Text style={styles.mediaBtnGhostText}>Select existing</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.mediaHint}>Accepts video, and Images</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Category</Text>
          <SelectField value={category || 'Fashion'} onPress={() => {}} />
          <Text style={[styles.label, styles.spaceTop]}>Gender</Text>
          <SelectField value={gender || 'Select Your Gender'} onPress={() => {}} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Attributes</Text>
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Sub category</Text>
              <SelectField value={subCategory || 'Select Product Sub'} onPress={() => {}} />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Type</Text>
              <SelectField value={productType || 'Select Product Type'} onPress={() => {}} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Options (Variant)</Text>
          <View style={styles.optionHeader}>
            <Icon name="add-circle-outline" size={20} color="#111111" />
            <Text style={styles.optionHeaderText}>Add options like color or size.</Text>
          </View>
          <Text style={styles.label}>Color</Text>
          <SelectField value={variantColor || 'Select a color'} onPress={() => {}} />
          <Text style={styles.label}>General size</Text>
          <SelectField value={variantSize || 'Select general sizes'} onPress={() => {}} />
          <Text style={styles.label}>Material</Text>
          <SelectField value={variantMaterial || 'Select a material'} onPress={() => {}} />
          <Text style={styles.label}>Stock</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter variant stock"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={variantStock}
            onChangeText={setVariantStock}
          />
          <Text style={styles.label}>Price</Text>
          <NairaInput value={variantPrice} onChangeText={setVariantPrice} placeholder="Enter variant price" />

          <View style={styles.rowBtnWrap}>
            <TouchableOpacity
              style={[styles.addVariantBtn, !hasVariantOptions && styles.addVariantBtnDisabled]}
              activeOpacity={0.88}
            >
              <Text style={styles.addVariantBtnText}>Add variant</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtn} activeOpacity={0.88}>
              <Text style={styles.clearBtnText}>Clear fields</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <Text style={styles.label}>Price</Text>
          <NairaInput value={price} onChangeText={setPrice} placeholder="Product price" />
          {price.trim().length > 0 && !isPriceValid ? (
            <Text style={styles.errorText}>Enter a valid price.</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          <Text style={styles.label}>Quantity</Text>
          <View style={styles.inventoryRow}>
            <Text style={styles.locationText}>Ifite Awka</Text>
            <TextInput
              style={styles.qtyInput}
              keyboardType="number-pad"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>
          <CheckRow
            label="Continue selling when out of stock"
            checked={continueSelling}
            onToggle={() => setContinueSelling((v) => !v)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shipping (Optional)</Text>
          <CheckRow
            label="Fragile (Is this product fragile.)"
            checked={fragile}
            onToggle={() => setFragile((v) => !v)}
          />

          <Text style={[styles.label, styles.spaceTop]}>Weight</Text>
          <SuffixInput value={weightKg} onChangeText={setWeightKg} suffix="kg" />

          <Text style={[styles.label, styles.spaceTop]}>Dimension (Optional)</Text>
          <View style={styles.row}>
            <View style={styles.third}>
              <Text style={styles.dimLabel}>Length</Text>
              <SuffixInput value={lengthCm} onChangeText={setLengthCm} suffix="cm" />
            </View>
            <View style={styles.third}>
              <Text style={styles.dimLabel}>Width</Text>
              <SuffixInput value={widthCm} onChangeText={setWidthCm} suffix="cm" />
            </View>
            <View style={styles.third}>
              <Text style={styles.dimLabel}>Height</Text>
              <SuffixInput value={heightCm} onChangeText={setHeightCm} suffix="cm" />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onSave} activeOpacity={0.88}>
          <Text style={styles.primaryBtnText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={showValidationModal} animationType="fade">
        <View style={styles.modalRoot}>
          <View style={styles.validationModalCard}>
            <Text style={styles.validationTitle}>Complete the form</Text>
            <Text style={styles.validationText}>
              Please fill in every required field on this page (title, category, price, quantity, and any
              category-specific options) before saving. Check the red messages next to each field.
            </Text>
            <TouchableOpacity
              style={styles.validationOkBtn}
              onPress={() => setShowValidationModal(false)}
              activeOpacity={0.88}
            >
              <Text style={styles.validationOkText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showFinishSheet} animationType="slide">
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setShowFinishSheet(false)} />
          <View style={[styles.sheetCard, { paddingBottom: insets.bottom + 14 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Finish & save</Text>
              <TouchableOpacity onPress={() => setShowFinishSheet(false)} hitSlop={8}>
                <Icon name="close" size={22} color="#111111" />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetHint}>
              Add brand and how you deliver. We'll validate the full product when you continue.
            </Text>
            <Text style={styles.label}>Product organization</Text>
            <TextInput
              style={styles.input}
              placeholder="Brand name (manufacturer)"
              placeholderTextColor="#9CA3AF"
              value={brandName}
              onChangeText={setBrandName}
            />
            <Text style={[styles.label, styles.spaceTop]}>Delivery methods</Text>
            <CheckRow
              label="Allow customers to pick up orders from your location"
              checked={allowPickup}
              onToggle={() => setAllowPickup((v) => !v)}
            />
            <CheckRow
              label="Deliver orders to the customer's address"
              checked={allowDelivery}
              onToggle={() => setAllowDelivery((v) => !v)}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={onContinueFinalSave} activeOpacity={0.88}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SelectField({ value, onPress }) {
  return (
    <TouchableOpacity style={styles.selectField} onPress={onPress} activeOpacity={0.88}>
      <Text style={styles.selectText}>{value}</Text>
      <Icon name="chevron-down" size={18} color="#C7CBD1" />
    </TouchableOpacity>
  );
}

function CheckRow({ label, checked, onToggle }) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onToggle} activeOpacity={0.88}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function NairaInput({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.currencyWrap}>
      <Text style={styles.currencySymbol}>₦</Text>
      <TextInput
        style={styles.currencyInput}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function SuffixInput({ value, onChangeText, suffix }) {
  return (
    <View style={styles.suffixWrap}>
      <TextInput
        style={styles.suffixInput}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChangeText}
      />
      <View style={styles.suffixBadge}>
        <Text style={styles.suffixText}>{suffix}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  backHit: {
    padding: 4,
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F2F4',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3F3F46',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111111',
  },
  descriptionInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111111',
    marginTop: 6,
  },
  toolbarRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 4,
    marginBottom: 6,
  },
  mediaBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D6D9DE',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  mediaBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaBtnActive: {
    backgroundColor: '#111111',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediaBtnGhost: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F6F7F9',
  },
  mediaBtnActiveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mediaBtnGhostText: {
    color: '#565D67',
    fontSize: 13,
    fontWeight: '600',
  },
  mediaHint: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },
  selectField: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: '#111111',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  half: {
    flex: 1,
  },
  third: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  optionHeaderText: {
    fontSize: 14,
    color: '#52525B',
  },
  currencyWrap: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    color: '#1F2937',
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    paddingVertical: 10,
  },
  rowBtnWrap: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  addVariantBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#D6DBE2',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVariantBtnDisabled: {
    opacity: 0.8,
  },
  addVariantBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  clearBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  clearBtnText: {
    color: '#2F3540',
    fontSize: 16,
    fontWeight: '600',
  },
  inventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 28,
    color: '#0F172A',
  },
  qtyInput: {
    width: 80,
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#BFC4CD',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    color: '#111111',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#B5BAC3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  checkLabel: {
    flex: 1,
    fontSize: 16,
    color: '#404A57',
  },
  suffixWrap: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#BFC4CD',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  suffixInput: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suffixBadge: {
    minHeight: 44,
    paddingHorizontal: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#BFC4CD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  suffixText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  dimLabel: {
    fontSize: 15,
    color: '#3F3F46',
    marginBottom: 4,
  },
  errorText: {
    marginTop: 6,
    color: '#DC2626',
    fontSize: 15,
  },
  spaceTop: {
    marginTop: 12,
  },
  primaryBtn: {
    marginTop: 14,
    backgroundColor: '#111111',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  validationModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  validationTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 10,
  },
  validationText: {
    fontSize: 24,
    lineHeight: 33,
    color: '#3F3F46',
  },
  validationOkBtn: {
    marginTop: 18,
    minHeight: 50,
    backgroundColor: '#111111',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validationOkText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111111',
  },
  sheetHint: {
    marginTop: 6,
    marginBottom: 12,
    color: '#52525B',
    fontSize: 14,
    lineHeight: 21,
  },
});
