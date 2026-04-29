import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
// import { useAuth } from '../hooks/useAuth';
// import CustomerTab from './customer';
import VendorTabs from './vendor';
// import AuthPurposeScreen from '../pages/auth/AuthPurposeScreen';
// import LoginScreen from '../pages/auth/LoginScreen';
// import OnboardingProfileScreen from '../pages/auth/OnboardingProfileScreen';
// import SignUpScreen from '../pages/auth/SignUpScreen';
// import VerifyCodeScreen from '../pages/auth/VerifyCodeScreen';
// import WelcomeScreen from '../pages/auth/WelcomeScreen';
import { SplashScreen } from '../pages/SplashScreen';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

/**
 * Auth-only stack (no app data routes). Main app is a separate stack after sign-in.
 */
export default function RootNavigator() {
//   const { status, initialAppRoute, activeRole, loginSkipAllowed, isGuest } = useAuth();

//   if (status === 'loading') {
  if (true === 'loading') {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#00926e" />
      </View>
    );
  }

//   if (status === 'signedOut') {
  if ('signedOut' !== 'signedOut') {
    return (
      <AuthStack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <AuthStack.Screen name="Splash" component={SplashScreen} />
        {/* <AuthStack.Screen name="AuthPurpose" component={AuthPurposeScreen} /> */}
        {/* <AuthStack.Screen
          name="Login"
          component={LoginScreen}
          initialParams={{ allowSkip: loginSkipAllowed }}
        />
        <AuthStack.Screen
          name="SignUp"
          component={SignUpScreen}
          initialParams={{ allowSkip: loginSkipAllowed }}
        />
        <AuthStack.Screen name="VerifyCode" component={VerifyCodeScreen} /> */}
      </AuthStack.Navigator>
    );
  }

  return (
    <AppStack.Navigator
    //   key={isGuest ? 'app-guest' : 'app-member'}
    //   initialRouteName={isGuest ? 'home' : initialAppRoute}
      screenOptions={{ headerShown: false }}
    >
      {/* {!isGuest ? (
        <AppStack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} />
      ) : null} */}
      <AppStack.Screen
        // key={`home-${activeRole}`}
        name="home"
        // component={activeRole === 'vendor' ? VendorTabs : CustomerTab}
        component={VendorTabs}
      />
    </AppStack.Navigator>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
