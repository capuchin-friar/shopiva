import { createNavigationContainerRef } from '@react-navigation/native';

/** Single ref passed to `NavigationContainer` in `index.js`. */
export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
