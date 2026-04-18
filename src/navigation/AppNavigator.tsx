import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {BootScreen} from '../screens/BootScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {LibraryScreen} from '../screens/LibraryScreen';
import {colors} from '../theme/colors';
import {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Boot"
        screenOptions={{
          animation: 'slide_from_right',
          contentStyle: {backgroundColor: colors.background},
          headerShown: false,
        }}>
        <Stack.Screen component={BootScreen} name="Boot" />
        <Stack.Screen component={HomeScreen} name="Home" />
        <Stack.Screen component={LibraryScreen} name="Library" />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
