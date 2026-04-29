import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
// import "../assets/Shopiva.png"


const w = Dimensions.get("screen").width;
const h = Dimensions.get("screen").height;
export function SplashScreen(){

    

    return(
        <>
            <View style={styles.root}>
                <View style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    justifyContent: "center"
                }}>
                    <Image style={{
                        height: 60,
                        width: 60,
                        marginBottom: 20
                    }} source={require("../assets/Shopiva.png")} />
                    <Text style={{
                        fontSize: 25
                    }}>
                        Shopiva
                    </Text>
                </View>

                <Text>
                    Sponsored by UP
                </Text>
            </View>
        </>
    )
}


const styles = StyleSheet.create({


    root: {
        height: h,
        width: w,
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "space-evenly"
    },



})