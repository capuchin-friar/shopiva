import { useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import {
    Alert,
    Text,
} from "react-native";



export default function OrderActionScreen(){

    const {order} = useRoute().params;

    useEffect(() => {
        console.log(order)
        Alert.alert(JSON.stringify(order))
    }, [order])

    return(
        <>
            <Text>Hello</Text>
        </>
    )
}