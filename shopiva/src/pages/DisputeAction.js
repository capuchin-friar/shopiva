import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { TextInput } from "react-native-gesture-handler";
import {
    errorCodes,
    isErrorWithCode,
    keepLocalCopy,
    pick,
    types,
} from "@react-native-documents/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getStoredUser } from "../auth/session";
import { connectChatSocket, emitSocketAck } from "../socket/chatSocket";
import { set_orderInfo } from "../../redux/order";
import { useDispatch } from "react-redux";
import { fetchShopOwner } from "../api";
import {
    getCurrentCoordinates,
    requestLocationPermission,
    reverseGeocodeToPlace,
} from "../utils/deviceLocation";
import { set_disputeInfo } from "../../redux/dispute";
import { set_disputeList } from "../../redux/disputes";

const DEFAULT_RETURN_COUNTRY = "Nigeria";

/**
 * @param {{
 *   confirmClaim: boolean;
 *   willReturnItem: boolean | null;
 *   roleForShipping: string | null;
 *   address1: string;
 *   address3: string;
 *   addressState: string;
 *   addressCountry: string;
 * }} values
 * @returns {Record<string, string>}
 */
function validateAcceptanceForm(values) {
    const errors = {};

    if (!values.confirmClaim) {
        errors.confirmClaim =
            "Please confirm you agree with the dispute resolution.";
    }

    if (values.willReturnItem == null || values.willReturnItem === "") {
        errors.willReturnItem =
            "Select whether the buyer should return the item(s).";
    }

    if (values.willReturnItem === true) {
        if (values.roleForShipping == null || values.roleForShipping === "") {
            errors.roleForShipping =
                "Select whether the buyer ships the item back or you arrange pickup.";
        }

        if (values.roleForShipping) {
            const street = values.address1.trim();
            const city = values.address3.trim();
            const stateVal = values.addressState.trim();
            const country = values.addressCountry.trim();

            if (!street) {
                errors.address1 = "Street address is required.";
            } else if (street.length < 3) {
                errors.address1 = "Enter a valid street address.";
            }

            if (!city) {
                errors.address3 = "City is required.";
            }

            if (!stateVal) {
                errors.addressState = "State is required.";
            }

            if (!country) {
                errors.addressCountry = "Country is required.";
            }
        }
    }

    return errors;
}

function FieldError({ message }) {
    if (!message) return null;
    return <Text style={styles.fieldErrorText}>{message}</Text>;
}

const VendorRejectReason = [
    { label: 'out of stock', value: 'out_of_stock' },
    { label: 'incorrect price', value: 'incorrect_price' },
    { label: 'cannot deliver', value: 'cannot_deliver' },
    { label: 'product damaged', value: 'product_damaged' },
    { label: 'store unavailable', value: 'store_unavailable' },
    { label: 'suspected fraud', value: 'suspected_fraud' },
    { label: 'shipping delay', value: 'shipping_delay' },
    { label: 'duplicate order', value: 'duplicate_order' },
    { label: 'product discontinued', value: 'product_discontinued' },
    { label: 'other', value: 'other' }
];

/** Used when vendor commits to a delivery / ship-by window. */
const FULFILLMENT_TIMEFRAME_OPTIONS = [
    { label: 'Within 24 hours (today)', value: '24_hrs' },
    { label: 'Within 48 hours (tomorrow)', value: '48_hrs' },
    { label: 'Within 72 hours (3 days)', value: '72_hrs' },
    { label: 'Within 96 hours (4 days)', value: '96_hrs' },
];

const SHIPPING_METHOD_OPTIONS = [
    { label: 'Third-party logistics partner', value: 'third_party_logistics' },
    { label: 'Dispatch rider', value: 'dispatch_rider' },
    { label: 'Courier service', value: 'courier_service' },
    { label: 'Bus transport / waybill', value: 'bus_waybill' },
    { label: 'Self delivery', value: 'self_delivery' },
    // { label: 'Customer pickup', value: 'customer_pickup' },
];

/** Carrier-assisted methods need a tracking / reference ID; self delivery does not. */
function shippingUsesTrackingId(method) {
    return method != null && method !== "self_delivery";
}

/** Who handles the final mile when marking out for delivery. */
const FINAL_DELIVERY_HANDLER_OPTIONS = [
    { label: "Third-party logistics", value: "third_party_logistics" },
    { label: "Dispatch rider", value: "dispatch_rider" },
    { label: "Courier service", value: "courier_service" },
    { label: "In-house / vendor team", value: "vendor_team" },
    { label: "Customer pickup (at hub)", value: "customer_pickup_hub" },
];

const MAX_DELIVERY_EVIDENCE = 8;
const MIN_DELIVERY_EVIDENCE = 2;

const CANCEL_ORDER_REASONS = [
    { label: "Changed my mind / Ordered by mistake", value: "changed_mind" },
    { label: "Shipping is taking too long", value: "delayed_shipping" },
    { label: "Vendor asked me to cancel", value: "vendor_requested_cancel" },
    { label: "Found a better price elsewhere", value: "better_price" },
    { label: "Other", value: "other" },
];

export default function DisputeActionScreen() {

    const {
        action,
        data
    } = useRoute().params;
    const [acceptance_value, set_acceptance_value] = useState("");

    function updateAccptance(data) {
        set_acceptance_value(data.value)
    }


    return (
        <>
            {
                action === "acceptance" && <Acceptance acceptance_value={acceptance_value} data={data} updateAccptance={updateAccptance} />
            }

            {
                action === "denial" && <Processing data={data} />
            }
        </>
    );
}

function ReturnAddressField({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    multiline = false,
}) {
    return (
        <View style={styles.addressFieldBlock}>
            <Text style={styles.addressFieldLabel}>{label}</Text>
            <TextInput
                style={[
                    styles.textInput,
                    styles.acceptanceFormInput,
                    multiline && styles.textInputMultiline,
                    error ? styles.textInputError : null,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                autoCapitalize="words"
                multiline={multiline}
            />
            <FieldError message={error} />
        </View>
    );
}

function ConfirmCheckbox({ checked, onToggle, label, rowStyle }) {
    return (
        <Pressable
            onPress={() => onToggle(!checked)}
            style={({ pressed }) => [
                styles.checkboxRow,
                rowStyle,
                pressed && styles.checkboxRowPressed,
            ]}
        >
            <View
                style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}
            >
                {checked ? (
                    <Text style={styles.checkboxMark}>✓</Text>
                ) : null}
            </View>
            <Text style={styles.checkboxLabel}>{label}</Text>
        </Pressable>
    );
}

function Acceptance({ data }) {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();

    const [note, setNote] = useState("");

    const [confirmClaim, setConfirmClaim] = useState(false);
    const [willReturnItem, setWillReturnItem] = useState(null);
    const [roleForShipping, setRoleForShipping] = useState(null);
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [address3, setAddress3] = useState("");
    const [addressState, setAddressState] = useState("");
    const [addressCountry, setAddressCountry] = useState(DEFAULT_RETURN_COUNTRY);
    const [locatingAddress, setLocatingAddress] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    const navigation = useNavigation();

    const errors = useMemo(
        () =>
            showErrors
                ? validateAcceptanceForm({
                      confirmClaim,
                      willReturnItem,
                      roleForShipping,
                      address1,
                      address3,
                      addressState,
                      addressCountry,
                  })
                : {},
        [
            showErrors,
            confirmClaim,
            willReturnItem,
            roleForShipping,
            address1,
            address3,
            addressState,
            addressCountry,
        ]
    );

    const onUseDeviceLocation = useCallback(async () => {
        setLocatingAddress(true);
        try {
            const granted = await requestLocationPermission();
            if (!granted) {
                Alert.alert(
                    "Location",
                    "Permission was denied. You can enter the address manually."
                );
                return;
            }
            const coords = await getCurrentCoordinates();
            const place = await reverseGeocodeToPlace(
                coords.latitude,
                coords.longitude
            );
            setAddress1(place.street);
            setAddress2(place.town);
            setAddress3(place.city);
            setAddressState(place.state);
            setAddressCountry(place.country || DEFAULT_RETURN_COUNTRY);
        } catch (e) {
            Alert.alert(
                "Location",
                e instanceof Error ? e.message : String(e)
            );
        } finally {
            setLocatingAddress(false);
        }
    }, []);
    useEffect(() => {
        connectChatSocket();
    }, [])


    return (
        <>
            <View style={[styles.cnt, styles.processingRoot]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.processingScrollContent,
                        styles.acceptanceScrollPaddingBottom,
                        { paddingTop: 15 },
                    ]}
                >
                    <View style={styles.processingCard}>
                        <Text style={styles.processingSectionTitle}>
                            Accept claims
                        </Text>
                        <Text style={styles.processingSectionSubtitle}>
                            Confirm each statement. The customer is notified
                            as soon as you accept his/her claims.
                        </Text>
                        <View style={styles.processingChecklist}>
                            <ConfirmCheckbox
                                checked={confirmClaim}
                                onToggle={setConfirmClaim}
                                label="I agree with the dispute resolution"
                                rowStyle={styles.processingCheckboxRow}
                            />
                            <View style={styles.processingChecklistDivider} />
                        </View>
                        <FieldError message={errors.confirmClaim} />
                    </View>

                    <View style={styles.processingCard}>
                        <View style={[{marginVertical: 10}]}>
                            <Text style={styles.processingFieldLabel}>
                                Should the buyer return the item(s)
                            </Text>
                            <Text style={styles.processingFieldHint}>
                                The buyer will be refunded even if the item is not returned.
                            </Text>
                            <Dropdown
                                style={[
                                    styles.processingDropdown,
                                    errors.willReturnItem
                                        ? styles.processingDropdownError
                                        : null,
                                ]}
                                containerStyle={styles.dropdownContainer}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                itemTextStyle={styles.processingDropdownItem}
                                iconStyle={styles.iconStyle}
                                data={[
                                    {label: "Yes, the buyer should return the item(s)", value: true},
                                    {label: "No, the buyer can keep the item(s)", value: false},
                                ]}
                                maxHeight={280}
                                labelField="label"
                                valueField="value"
                                placeholder="Select if item will be returned"
                                value={willReturnItem}
                                onChange={(item) => {
                                    setWillReturnItem(item.value);
                                    if (item.value === false) {
                                        setRoleForShipping(null);
                                    }
                                }}
                            />
                            <FieldError message={errors.willReturnItem} />
                        </View>
                        {willReturnItem && <View style={[{marginVertical: 10}]}>
                            <Text style={styles.processingFieldLabel}>
                                Return pickup or buyer shipping?
                            </Text>
                            <Text style={styles.processingFieldHint}>
                                Do the buyer ship the item(s) OR Will you pick it up yourself
                            </Text>
                            <Dropdown
                                style={[
                                    styles.processingDropdown,
                                    errors.roleForShipping
                                        ? styles.processingDropdownError
                                        : null,
                                ]}
                                containerStyle={styles.dropdownContainer}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                itemTextStyle={styles.processingDropdownItem}
                                iconStyle={styles.iconStyle}
                                data={[
                                    { label: "Buyer'll ships item back [Recommended]", value: "buyer_shipping" },
                                    { label: "I'll arrange pickup", value: "vendor_pickup" },
                                ]}
                                maxHeight={280}
                                labelField="label"
                                valueField="value"
                                placeholder="Select an option"
                                value={roleForShipping}
                                onChange={(item) =>
                                    setRoleForShipping(item.value)
                                }
                            />
                            <FieldError message={errors.roleForShipping} />
                        </View>}
                        {roleForShipping && (
                            <View style={{ marginVertical: 10 }}>
                                <Text style={styles.processingFieldLabel}>
                                    Return delivery address
                                </Text>
                                <Text style={styles.processingFieldHint}>
                                    {roleForShipping === "vendor_pickup"
                                        ? "Where should the buyer expect pickup, or where will you collect the item?"
                                        : "Where should the buyer ship the returned item(s)?"}
                                </Text>
                                <Pressable
                                    onPress={() => {
                                        void onUseDeviceLocation();
                                    }}
                                    disabled={locatingAddress}
                                    style={({ pressed }) => [
                                        styles.locationFillBtn,
                                        pressed && styles.locationFillBtnPressed,
                                        locatingAddress && styles.locationFillBtnDisabled,
                                    ]}
                                >
                                    {locatingAddress ? (
                                        <ActivityIndicator color="#0D8A4A" size="small" />
                                    ) : (
                                        <Text style={styles.locationFillBtnText}>
                                            Use my current location
                                        </Text>
                                    )}
                                </Pressable>
                                <ReturnAddressField
                                    label="Street address"
                                    value={address1}
                                    onChangeText={setAddress1}
                                    placeholder="e.g. 12 Admiralty Way"
                                    error={errors.address1}
                                />
                                <ReturnAddressField
                                    label="Town / area"
                                    value={address2}
                                    onChangeText={setAddress2}
                                    placeholder="e.g. Lekki Phase 1"
                                />
                                <ReturnAddressField
                                    label="City"
                                    value={address3}
                                    onChangeText={setAddress3}
                                    placeholder="e.g. Lagos"
                                    error={errors.address3}
                                />
                                <ReturnAddressField
                                    label="State"
                                    value={addressState}
                                    onChangeText={setAddressState}
                                    placeholder="e.g. Lagos"
                                    error={errors.addressState}
                                />
                                <ReturnAddressField
                                    label="Country"
                                    value={addressCountry}
                                    onChangeText={setAddressCountry}
                                    placeholder={DEFAULT_RETURN_COUNTRY}
                                    error={errors.addressCountry}
                                />
                            </View>
                        )}
                    </View>

                    <View style={styles.processingCard}>
                        <Text style={styles.processingFieldLabel}>
                            Notes (optional)
                        </Text>
                        <Text style={styles.processingFieldHint}>
                            Optional message stored on the order.
                        </Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                styles.textInputMultiline,
                                styles.acceptanceFormInput,
                            ]}
                            multiline
                            placeholder="Note something down…"
                            onChangeText={(txt) => setNote(txt)}
                        />
                    </View>

                    <View
                        style={[
                            styles.processingCard,
                            styles.acceptDisclaimerCard,
                        ]}
                    >
                        <Text style={styles.acceptIntroText}>
                            By accepting this order, you confirm that the
                            products are available and will be shipped within
                            the required timeframe.
                        </Text>
                    </View>
                </ScrollView>

                <View
                    style={[
                        styles.actionBar,
                        { paddingBottom: Math.max(insets.bottom, 12) },
                    ]}
                >
                    <Pressable
                        onPress={e => navigation.goBack()}
                        style={({ pressed }) => [
                            styles.btnSecondary,
                            pressed && styles.btnSecondaryPressed,
                        ]}
                    >
                        <Text style={styles.btnSecondaryText}>Cancel</Text>
                    </Pressable>

                    <Pressable
                        onPress={async () => {
                            const validationErrors = validateAcceptanceForm({
                                confirmClaim,
                                willReturnItem,
                                roleForShipping,
                                address1,
                                address3,
                                addressState,
                                addressCountry,
                            });
                            if (Object.keys(validationErrors).length > 0) {
                                setShowErrors(true);
                                return;
                            }
                            setShowErrors(false);
                            const u = await getStoredUser();
                            const returnAddress =
                                willReturnItem && roleForShipping
                                    ? {
                                          address1: address1.trim(),
                                          address2: address2.trim(),
                                          address3: address3.trim(),
                                          state: addressState.trim(),
                                          country:
                                              addressCountry.trim() ||
                                              DEFAULT_RETURN_COUNTRY,
                                      }
                                    : null;
                            const response = await emitSocketAck(
                                "dispute_acceptance",
                                {
                                    
                                    ...data,
                                    response: {
                                        will_return_item: willReturnItem,
                                        return_shipping_role: roleForShipping,
                                        return_address: returnAddress,
                                    },
                                    notes: note,
                                    actor_id: u.id,
                                }
                            );
                            if (response.success) {
                                console.log(response)
                                dispatch(set_disputeInfo(response.dispute.vendor.vdi));
                                dispatch(set_disputeList(response.dispute.vendor.vdl));

                                navigation.goBack();
                            }
                        }}
                        style={({ pressed }) => [
                            styles.btnAccept,
                            pressed && styles.btnAcceptPressed,
                        ]}
                    >
                        <Text style={styles.btnAcceptText}>Accept</Text>
                    </Pressable>
                </View>
            </View>
        </>
    )
}

/** Customer cancels before / during fulfillment (escrow cancel delivery). */
function CancelOrder({ data }) {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [cancelReason, setCancelReason] = useState(null);
    const [otherReason, setOtherReason] = useState("");
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const postShipment = Boolean(data?.post_shipment);
    const orderTotal = Number(data?.order_total ?? 0);
    const restockingFee = Number(data?.restocking_fee ?? 0);
    const refundAmount = Math.max(0, orderTotal - restockingFee);

    useEffect(() => {
        connectChatSocket();
    }, []);

    const validate = () => {
        if (!cancelReason) {
            Alert.alert(
                "Reason required",
                "Select why you are cancelling this order."
            );
            return false;
        }
        if (cancelReason === "other" && !otherReason.trim()) {
            Alert.alert(
                "Details required",
                "Briefly describe your reason for cancelling."
            );
            return false;
        }
        if (!confirmCancel) {
            Alert.alert(
                "Confirmation required",
                "Confirm that you want to cancel this order."
            );
            return false;
        }
        return true;
    };

    const submitCancellation = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const u = await getStoredUser();
            const reason =
                cancelReason === "other"
                    ? otherReason.trim()
                    : cancelReason;
            const response = await emitSocketAck("order_cancelled", {
                ...data,
                meta: {
                    ...(data.meta && typeof data.meta === "object"
                        ? data.meta
                        : {}),
                    reason,
                    cancel_reason_code: cancelReason,
                    post_shipment: postShipment,
                    order_total: orderTotal,
                    restocking_fee: restockingFee,
                    refund_amount: refundAmount,
                },
                notes:
                    cancelReason === "other"
                        ? otherReason.trim()
                        : "",
                outcome: "success",
                actor_id: u.id,
            });
            if (response.success) {
                dispatch(set_orderInfo(response.result));
                navigation.goBack();
            } else {
                Alert.alert(
                    "Cancellation failed",
                    response?.message ||
                        response?.error ||
                        "Could not cancel this order. Try again."
                );
            }
        } catch (e) {
            Alert.alert(
                "Cancellation failed",
                e instanceof Error ? e.message : String(e)
            );
        } finally {
            setSubmitting(false);
        }
    };

    const onPressConfirm = () => {
        if (!validate()) return;

        if (postShipment) {
            Alert.alert(
                "Cancel delivery",
                `The vendor has already packed and shipped your order.\n\nA restocking fee of ₦${restockingFee.toLocaleString()} may be deducted from your refund.\n\nEstimated refund: ₦${refundAmount.toLocaleString()}`,
                [
                    { text: "Keep order", style: "cancel" },
                    {
                        text: "Confirm cancellation",
                        style: "destructive",
                        onPress: submitCancellation,
                    },
                    {
                        text: "Raise dispute instead",
                        onPress: () =>
                            navigation.navigate("Open-dispute", {
                                orderId: data?.order_id,
                            }),
                    },
                ]
            );
            return;
        }

        Alert.alert(
            "Cancel order",
            "Are you sure you want to cancel this order?",
            [
                { text: "Keep order", style: "cancel" },
                {
                    text: "Confirm cancellation",
                    style: "destructive",
                    onPress: submitCancellation,
                },
            ]
        );
    };

    return (
        <View style={[styles.cnt, styles.processingRoot]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.processingScrollContent,
                    styles.acceptanceScrollPaddingBottom,
                    { paddingTop: 15 },
                ]}
            >
                <View style={styles.processingCard}>
                    <Text style={styles.processingSectionTitle}>
                        Order cancellation
                    </Text>
                    <Text style={styles.processingSectionSubtitle}>
                        {postShipment
                            ? "This order is already in transit. Cancelling may reduce your refund."
                            : "Tell us why you want to cancel. The vendor will be notified."}
                    </Text>
                </View>

                {postShipment ? (
                    <View
                        style={[
                            styles.processingCard,
                            styles.acceptDisclaimerCard,
                            {backgroundColor: "#fff"}
                        ]}
                    >
                        <Text style={styles.acceptIntroText}>
                            Restocking fee (est.): ₦
                            {restockingFee.toLocaleString()}
                            {"\n"}
                            Estimated refund: ₦
                            {refundAmount.toLocaleString()}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.processingCard}>
                    <Text style={styles.processingFieldLabel}>
                        Cancellation reason
                    </Text>
                    <Text style={styles.processingFieldHint}>
                        Select the option that best describes your situation.
                    </Text>
                    <Dropdown
                        style={styles.processingDropdown}
                        containerStyle={styles.dropdownContainer}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        itemTextStyle={styles.processingDropdownItem}
                        iconStyle={styles.iconStyle}
                        data={CANCEL_ORDER_REASONS}
                        maxHeight={320}
                        labelField="label"
                        valueField="value"
                        placeholder="Select reason"
                        value={cancelReason}
                        onChange={(item) => setCancelReason(item.value)}
                    />
                </View>

                {cancelReason === "other" ? (
                    <View style={styles.processingCard}>
                        <Text style={styles.processingFieldLabel}>
                            Other reason
                        </Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                styles.textInputMultiline,
                                styles.acceptanceFormInput,
                            ]}
                            multiline
                            placeholder="Describe why you are cancelling…"
                            value={otherReason}
                            onChangeText={setOtherReason}
                        />
                    </View>
                ) : null}

                <View style={styles.processingCard}>
                    <View style={styles.processingChecklist}>
                        <ConfirmCheckbox
                            checked={confirmCancel}
                            onToggle={setConfirmCancel}
                            label="I understand this order will be cancelled and I may receive a partial refund depending on order status."
                            rowStyle={styles.processingCheckboxRow}
                        />
                    </View>
                </View>
            </ScrollView>

            <View
                style={[
                    styles.actionBar,
                    { paddingBottom: Math.max(insets.bottom, 12) },
                ]}
            >
                <Pressable
                    onPress={() => navigation.goBack()}
                    disabled={submitting}
                    style={({ pressed }) => [
                        styles.btnSecondary,
                        pressed && styles.btnSecondaryPressed,
                    ]}
                >
                    <Text style={styles.btnSecondaryText}>Keep order</Text>
                </Pressable>
                <Pressable
                    onPress={onPressConfirm}
                    disabled={submitting}
                    style={({ pressed }) => [
                        styles.btnReject,
                        pressed && styles.btnRejectPressed,
                    ]}
                >
                    <Text style={styles.btnRejectText}>
                        {submitting ? "Cancelling…" : "Confirm cancellation"}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    cnt: {
        flex: 1,
        // backgroundColor: '#FFFFFF',
    },
    processingRoot: {
        backgroundColor: '#F2F3F5',
    },
    processingScrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    acceptanceScrollPaddingBottom: {
        paddingBottom: 100,
    },
    acceptanceFormInput: {
        borderRadius: 5,
        borderColor: '#DCDCE0',
    },
    acceptDisclaimerCard: {
        backgroundColor: '#F8F9FA',
        borderColor: '#ECECEF',
    },
    processingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        padding: 16,
        marginBottom: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E6E7EB',
    },
    processingSectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111111',
        letterSpacing: -0.3,
        marginBottom: 6,
    },
    processingSectionSubtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: '#5C5C66',
        lineHeight: 19,
        marginBottom: 14,
    },
    processingChecklist: {
        backgroundColor: '#F8F9FA',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ECECEF',
        overflow: 'hidden',
    },
    processingChecklistDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E2E2E6',
        marginLeft: 46,
    },
    processingCheckboxRow: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    processingFieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111111',
        marginBottom: 4,
    },
    processingFieldHint: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B6B76',
        lineHeight: 17,
        marginBottom: 12,
    },
    addressFieldBlock: {
        marginBottom: 12,
    },
    addressFieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 6,
    },
    locationFillBtn: {
        alignSelf: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#0D8A4A',
        marginBottom: 14,
        minWidth: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationFillBtnPressed: {
        opacity: 0.85,
    },
    locationFillBtnDisabled: {
        opacity: 0.6,
    },
    locationFillBtnText: {
        color: '#0D8A4A',
        fontWeight: '700',
        fontSize: 14,
    },
    processingDropdown: {
        minHeight: 50,
        borderColor: '#DCDCE0',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 14,
        backgroundColor: '#FAFAFA',
    },
    processingDropdownItem: {
        fontSize: 14,
        color: '#111111',
    },
    shippingTrackingLabel: {
        marginTop: 16,
    },
    evidenceGalleryRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 4,
        paddingRight: 4,
    },
    evidenceTile: {
        width: 104,
        height: 104,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#ECECEF",
        borderWidth: 1,
        borderColor: "#DCDCE0",
    },
    evidenceImage: {
        width: "100%",
        height: "100%",
    },
    evidenceRemoveBtn: {
        position: "absolute",
        top: 4,
        right: 4,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
    },
    evidenceRemoveBtnPressed: {
        backgroundColor: "rgba(0,0,0,0.75)",
    },
    evidenceRemoveText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        lineHeight: 20,
        marginTop: -1,
    },
    evidenceAddTile: {
        width: 104,
        height: 104,
        borderRadius: 8,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#0D8A4A",
        backgroundColor: "#F0FAF4",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    evidenceAddTilePressed: {
        backgroundColor: "#DCEFE6",
    },
    evidenceAddPlus: {
        fontSize: 28,
        fontWeight: "300",
        color: "#0D8A4A",
        lineHeight: 32,
    },
    evidenceAddLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#0D8A4A",
        marginTop: 2,
        textAlign: "center",
    },
    evidenceCountLabel: {
        marginTop: 10,
        fontSize: 12,
        fontWeight: "500",
        color: "#6B6B76",
    },
    actionBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: "#fff",
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E2E2E6',
    },
    btnAccept: {
        flex: 1,
        height: 44,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0D8A4A',
    },
    btnAcceptPressed: {
        backgroundColor: '#0A6B3A',
    },
    btnAcceptText: {
        fontSize: 13,
        fontWeight: '700',
        color: "#fff",
    },
    btnSecondary: {
        flex: 1,
        height: 44,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    btnSecondaryPressed: {
        backgroundColor: "#EBEBEB",
    },
    btnSecondaryText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#111111",
    },
    btnReject: {
        flex: 1,
        height: 44,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C62828',
    },
    btnRejectPressed: {
        backgroundColor: '#A01A1A',
    },
    btnRejectText: {
        fontSize: 13,
        fontWeight: '700',
        color: "#fff",
    },
    dropdownBlock: {
        width: '95%',
        alignSelf: 'center',
    },
    dropdown: {
        minHeight: 52,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 14,
        backgroundColor: '#FAFAFA',
        marginTop: 8,
    },
    dropdownContainer: {
        borderRadius: 8,
        borderColor: '#E0E0E0',
        borderWidth: 1,
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#999999',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#111111',
        fontWeight: '600',
    },
    itemTextStyle: {
        fontSize: 14,
        textTransform: "capitalize",
        color: '#111111',
    },
    inputSearchStyle: {
        height: 44,
        fontSize: 14,
        borderRadius: 8,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        paddingHorizontal: 12,
    },
    iconStyle: {
        width: 20,
        height: 20,
        tintColor: '#999999',
    },
    errorText: {
        marginTop: 8,
        fontSize: 13,
        color: '#C62828',
        fontWeight: '500',
    },
    fieldErrorText: {
        marginTop: 4,
        fontSize: 12,
        color: '#C62828',
        fontWeight: '500',
    },
    textInputError: {
        borderColor: '#C62828',
        backgroundColor: '#FFF8F8',
    },
    processingDropdownError: {
        borderColor: '#C62828',
        backgroundColor: '#FFF8F8',
    },
    inputCnt: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginVertical: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111111',
        marginBottom: 8,
    },
    acceptIntroText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#333333',
        lineHeight: 22,
    },
    textInput: {
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#111111',
        backgroundColor: '#FAFAFA',
    },
    textInputMultiline: {
        height: 100,
        textAlignVertical: 'top',
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
    },
    checkboxRowPressed: {
        opacity: 0.75,
    },
    checkboxBox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        backgroundColor: "#FAFAFA",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxBoxChecked: {
        backgroundColor: "#0D8A4A",
        borderColor: "#0D8A4A",
    },
    checkboxMark: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        color: "#111111",
    },
})