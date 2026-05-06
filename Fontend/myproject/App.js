import Login from './screens/User/Login';
import Register from './screens/User/Register';
import Home from './screens/Home/Home';
import DoctorDetail from './screens/User/DoctorDetail';
import UserProfile from './screens/User/UserProfile';
import Booking from './screens/Appointment/Booking';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import { View } from 'react-native';
import Scheduler from './screens/User/Schedule';
import { MyUserContext } from './utils/contexts/MyUserContext';
import { useContext, useEffect, useReducer, useState } from 'react';
import MyUserReducer from './utils/reducers/MyUserReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import ListAppointments from './screens/Appointment/ListAppointments';
import AppointmentDetail from './screens/Appointment/AppointmentDetail';
import ProfileDetail from './screens/User/ProfileDetail';
import { createPublic } from './utils/apiHelper';
import { endpoints } from './configs/Apis';
import { CLIENT_ID_APP, CLIENT_SECRET_APP } from "@env"


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StackUserNavigator = () => {
  // thông tin user toàn cục
  const { user } = useContext(MyUserContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserProfile" component={UserProfile} />
      {user ? (
        <>
          <Stack.Screen name="Schedule" component={Scheduler} />
          <Stack.Screen name="ProfileDetail" component={ProfileDetail} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
}

const StackHomeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="DoctorDetail" component={DoctorDetail} />
    </Stack.Navigator>
  );
}

const AppointmentNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Booking" component={Booking} />
      <Stack.Screen name="ListAppointments" component={ListAppointments} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetail} />
    </Stack.Navigator>
  );
}

const ListAppointmentNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListAppointments" component={ListAppointments} />
    <Stack.Screen name="AppointmentDetail" component={AppointmentDetail} />
  </Stack.Navigator>
);


const TabNavigatior = () => {
  const { user } = useContext(MyUserContext);

  const requireAuth = (navigation, targetScreen) => ({
    tabPress: (e) => {
      if (!user) {
        e.preventDefault();
        navigation.navigate("User");
      }
    },
  });

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={StackHomeNavigator} options={{ tabBarIcon: () => <Icon size={20} source="home" /> }} />
      <Tab.Screen name="Booking" component={AppointmentNavigator} listeners={({ navigation }) => requireAuth(navigation, "Booking")} options={{ tabBarIcon: () => <Icon size={20} source="calendar" /> }} />
      <Tab.Screen name="TabAppointments" component={ListAppointmentNavigator} listeners={({ navigation }) => requireAuth(navigation, "ListAppointments")} options={{ tabBarIcon: () => <Icon size={20} source="calendar" /> }} />
      <Tab.Screen name="User" component={StackUserNavigator} options={{ tabBarIcon: () => <Icon size={20} source="account" /> }} />
    </Tab.Navigator>
  );
}



const App = () => {

  const [user, dispatch] = useReducer(MyUserReducer, null);

  const loadUser = async () => {
    const savedStr = await SecureStore.getItemAsync("user");
    const saved = savedStr ? JSON.parse(savedStr) : null;
    const isExpired = saved ? Date.now() >= saved.tokenExpiresAt : true;
    if (isExpired) {
      if (saved === null){
        return
      }
      await createPublic(
        endpoints.login,
        {
          refresh_token: saved.refresh_token,
          client_id: CLIENT_ID_APP,
          client_secret: CLIENT_SECRET_APP,
          grant_type: "refresh_token",
        },
        (data) => {
          const updated = {
            ...saved,
            tokenExpiresAt: Date.now()+ data.expires_in * 1000, //
            refresh_token: data.refresh_token,
          }
          SecureStore.setItemAsync("user", JSON.stringify(updated));
          dispatch({ type: "LOGIN", payload: updated});
        },
        (err, onError) => {
          SecureStore.deleteItemAsync("user");
          console.log("chuyenr đến login")
        }
      )
    }
    else {
      dispatch({ type: "LOGIN", payload: saved});
    }
  }

  useEffect(() => {
    loadUser();
  }, [])


  return (
    <MyUserContext.Provider value={{ user, dispatch }}>
      <NavigationContainer>
        <TabNavigatior />
      </NavigationContainer>
    </MyUserContext.Provider>
  );
}

export default App;
