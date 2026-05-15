import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getStoredUser } from "../auth/session";
import { connectChatSocket, emitSocketAck, getChatSocket } from "../socket/chatSocket";
import { set_orderInfo } from "../../redux/order";
import { useDispatch } from "react-redux";

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

export default function OrderActionScreen(){

    const {
        action,
        data
    } = useRoute().params;
    const [acceptance_value, set_acceptance_value] = useState("");
    



    function updateAccptance(data){
        set_acceptance_value(data.value)
    }

    function updateReason(data){
        setReason(data)
    }

    function updateNote(data){
        setNote(data)
    }

   

    return(
        <>
            {
                action === "acceptance" && <Acceptance acceptance_value={acceptance_value} data={data} updateAccptance={updateAccptance} />
            }
        </>
    )
}

function ConfirmCheckbox({ checked, onToggle, label }) {
    return (
        <Pressable
            onPress={() => onToggle(!checked)}
            style={({ pressed }) => [
                styles.checkboxRow,
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

function Acceptance({acceptance_value, updateAccptance, data}){
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    
    const [reason, setReason] = useState("");
    const [note, setNote] = useState("");

    const [confirmItemsInStock, setConfirmItemsInStock] = useState(false);
    const [confirmFulfillOnTime, setConfirmFulfillOnTime] = useState(false);
    const [confirmPerformancePolicy, setConfirmPerformancePolicy] =
        useState(false);

    const navigation = useNavigation();
    useEffect(() => {
        connectChatSocket();
    }, [])


    if(data.stage === "order_rejected"){    
        return(
            <>
                <View style={styles.cnt}>

                    <ScrollView >
                        <View style={styles.inputCnt}>
                            <Text style={styles.inputLabel}>Why are you unable to fulfill this order</Text>
                            <Dropdown
                                style={styles.dropdown}
                                containerStyle={styles.dropdownContainer}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                itemTextStyle={styles.itemTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                data={VendorRejectReason}
                                search
                                maxHeight={280}
                                labelField="label"
                                valueField="value"
                                placeholder="Select reason"
                                searchPlaceholder="Search reasons..."
                                value={acceptance_value}
                                onChange={(item) => {
                                    updateAccptance(item);
                                    setReason(item.value);
                                    // setCategoryGateError('');
                                }}
                            />
                        </View>
                        {
                            acceptance_value === "other" && 
                            <View style={styles.inputCnt}>
                                <Text style={styles.inputLabel}>Other reason</Text>
                                <TextInput style={styles.textInput} placeholder="Other reason" onChangeText={txt => {
                                    // updateAccptance(txt)
                                    setReason(txt)
                                }} />
                            </View>
                        }
                        <View style={styles.inputCnt}>
                            <Text style={styles.inputLabel}>Describe reason (Optional)</Text>
                            <TextInput style={[styles.textInput, styles.textInputMultiline]} multiline placeholder="Describe reason..." onChangeText={txt => {
                                updateAccptance(txt)
                                setNote(txt)
                            }} />
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
                            
                            style={({ pressed }) => [styles.btnAccept, pressed && styles.btnAcceptPressed]}
                        >
                            <Text style={styles.btnAcceptText}>Cancel</Text>
                        </Pressable>
                
                        <Pressable
                            // onPress={onResendInvoice}
                            onPress={e => {
                                Alert.alert(
                                    "Reject Order Warning",
                                    "You will not be able to reinstate this order after you reject it.",
                                    [
                                        {
                                            text: 'Cancel',
                                            style: 'cancel',
                                        },
                                        {
                                            text: 'Reject',
                                            style: 'destructive',
                                            onPress: async () => {
                                                const u = await getStoredUser();
                                                const response = await emitSocketAck("order_acceptance", {
                                                    ...data,
                                                    meta: {
                                                        reason: reason
                                                    },
                                                    notes: note,
                                                    actor_id: u.id
                                                });
                                                if(response.success) {
                                                    dispatch(set_orderInfo(response.result))
                                                    navigation.goBack();
                                                }
                                            }
                                        }
                                    ]
                                )
                            }}
                            style={({ pressed }) => [styles.btnReject, pressed && styles.btnRejectPressed]}
                        >
                            <Text style={styles.btnRejectText}>Reject</Text>
                        </Pressable>
                    </View>
                </View>
            </>
        )
    }else{
        return(
            <>
                <View style={styles.cnt}>

                    <ScrollView
                        contentContainerStyle={styles.acceptScrollContent}
                    >
                        <View style={styles.inputCnt}>
                            <Text style={styles.inputLabel}>
                                Before you accept, confirm each statement below.
                            </Text>
                            <ConfirmCheckbox
                                checked={confirmItemsInStock}
                                onToggle={setConfirmItemsInStock}
                                label="Items are available in stock"
                            />
                            <ConfirmCheckbox
                                checked={confirmFulfillOnTime}
                                onToggle={setConfirmFulfillOnTime}
                                label="I can fulfill this order on time"
                            />
                            <ConfirmCheckbox
                                checked={confirmPerformancePolicy}
                                onToggle={setConfirmPerformancePolicy}
                                label="I understand performance policy"
                            />
                        </View>

                        <View style={styles.inputCnt}>
                            <Text style={styles.inputLabel}>Notes (Optional)</Text>
                            <TextInput style={[styles.textInput, styles.textInputMultiline]} multiline placeholder="Note something down..." onChangeText={txt => {
                                updateAccptance(txt)
                                setNote(txt)
                            }} />
                        </View>

                        <View style={[styles.inputCnt, styles.acceptIntroBlock]}>
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
                                if (
                                    !confirmItemsInStock ||
                                    !confirmFulfillOnTime ||
                                    !confirmPerformancePolicy
                                ) {
                                    Alert.alert(
                                        "Confirmation required",
                                        "Please confirm all statements before accepting this order."
                                    );
                                    return;
                                }
                                const u = await getStoredUser();
                                const response = await emitSocketAck(
                                    "order_acceptance",
                                    {
                                        ...data,
                                        meta: {
                                            ...(data.meta &&
                                            typeof data.meta === "object"
                                                ? data.meta
                                                : {}),
                                            vendor_confirmations: {
                                                items_in_stock: true,
                                                fulfill_on_time: true,
                                                performance_policy: true,
                                            },
                                        },
                                        notes: note,
                                        actor_id: u.id,
                                    }
                                );
                                if (response.success) {
                                    dispatch(set_orderInfo(response.result));
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
}


const styles = StyleSheet.create({
    cnt: {
        flex: 1,
        // backgroundColor: '#FFFFFF',
    },
    acceptScrollContent: {
        paddingBottom: 100,
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
    acceptIntroBlock: {
        paddingBottom: 24,
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