// jest.setup.js
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo Router - UPDATED with proper useFocusEffect
jest.mock('expo-router', () => {
  const actualRouter = jest.requireActual('expo-router');
  return {
    ...actualRouter,
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    },
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    })),
    useLocalSearchParams: jest.fn(() => ({})),
    // FIX: Properly mock useFocusEffect
    useFocusEffect: jest.fn((callback) => {
      // Call the callback once when component mounts
      // Don't call it repeatedly
      if (typeof callback === 'function') {
        callback();
      }
    }),
  };
});

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock NativeModules for P2P
// jest.mock('react-native', () => ({
//   ...jest.requireActual('react-native'),
//   NativeModules: {
//     WiFiDirect: undefined,
//     MultipeerConnectivity: undefined,
//   },
// }));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};