import Login from './screens/User/Login';
import Register from './screens/User/Register';
import Home from './screens/Home/Home';
import DoctorDetail from './screens/User/DoctorDetail';
import UserProfile from './screens/User/UserProfile';
import Booking from './screens/Appointment/Booking';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, Snackbar } from 'react-native-paper';
import { Alert, View } from 'react-native';
import Scheduler from './screens/User/Schedule';
import { MyUserContext } from './utils/contexts/MyUserContext';
import { useContext, useEffect, useReducer, useState } from 'react';
import MyUserReducer from './utils/reducers/MyUserReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import ListAppointments from './screens/Appointment/ListAppointments';
import AppointmentDetail from './screens/Appointment/AppointmentDetail';
import MedicalRecordDetail from './screens/MedicalRecord/MedicalRecordDetail';
import MedicalRecordList from './screens/MedicalRecord/MedicalRecordList';
import CreateMedicalRecord from './screens/MedicalRecord/CreateMedicalRecord';
import UpdateMedicalRecord from './screens/MedicalRecord/UpdateMedicalRecord';
import UpdatePrescription from './screens/MedicalRecord/UpdatePrescription';
import UpdateTestResults from './screens/MedicalRecord/UpdateTestResults';
import ProfileDetail from './screens/User/ProfileDetail';
import { createPublic } from './utils/apiHelper';
import { endpoints } from './configs/Apis';
import { CLIENT_ID_APP, CLIENT_SECRET_APP } from "@env"
import SnackbarProvider from './utils/contexts/SnackBarContext';
import { SafeAreaProvider } from "react-native-safe-area-context";
import Workday from './screens/WorkDay/Workday';
import AlertProvider, { useAlert } from './utils/contexts/AlertContext';
import Information from './screens/Home/Information';
import Mystyles from './styles/Mystyles';
import COLORS from './styles/Colors';
import Chat from './screens/BoxChat/Chat';
import Search from './screens/Home/Search';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StackUserNavigator = () => {
  const { user } = useContext(MyUserContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={"UserProfile"}>
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="Information" component={Information} />
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
      <Stack.Screen name="Search" component={Search} />
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
    <Stack.Screen name="MedicalRecordList" component={MedicalRecordList} />
    <Stack.Screen name="MedicalRecordDetail" component={MedicalRecordDetail} />
    <Stack.Screen name="CreateMedicalRecord" component={CreateMedicalRecord} />
  </Stack.Navigator>
);

const MedicalRecordNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MedicalRecordList" component={MedicalRecordList} />
    <Stack.Screen name="MedicalRecordDetail" component={MedicalRecordDetail} />
    <Stack.Screen name="UpdateMedicalRecord" component={UpdateMedicalRecord} />
    <Stack.Screen name="UpdatePrescription" component={UpdatePrescription} />
    <Stack.Screen name="UpdateTestResults" component={UpdateTestResults} />
  </Stack.Navigator>
);


const TabNavigatior = () => {
  const { user } = useContext(MyUserContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        unmountOnBlur: true
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={StackHomeNavigator}
        options={{
          tabBarLabel: "Trang chủ",
          tabBarIcon: ({ color }) => <Icon size={22} source="home-outline" color={color} />,
        }}
      />
      <Tab.Screen
        name="BookingTab"
        component={AppointmentNavigator}
        options={{
          tabBarLabel: "Đặt lịch",
          tabBarIcon: ({ color }) => <Icon size={22} source="calendar-plus" color={color} />,
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={Chat}
        options={{
          tabBarLabel: "Chatbox hỗ trợ",
          tabBarIcon: ({ color }) => <Icon size={22} source="message-text" color={color} />,
        }}
      />

        <Tab.Screen
          name="WorkdayTab"
          component={Workday}
          options={{
            tabBarLabel: "Lịch làm",
            tabBarIcon: ({ color }) => <Icon size={22} source="calendar-check-outline" color={color} />,
          }}
        />

      <Tab.Screen
        name="AppointmentsTab"
        component={ListAppointmentNavigator}
        options={{
          tabBarLabel: "Lịch hẹn",
          tabBarIcon: ({ color }) => <Icon size={22} source="clipboard-list-outline" color={color} />,
        }}
      />
      <Tab.Screen 
        name="MedicalRecordTab" 
        component={MedicalRecordNavigator} 
        options={{ 
          tabBarLabel: 'Bệnh án', 
          tabBarIcon: ({ color }) => <Icon size={20} source="file-document"  color={color} /> }} 
      />
      <Tab.Screen
        name="UserTab"
        component={StackUserNavigator}
        options={{
          tabBarLabel: "Tài khoản",
          tabBarIcon: ({ color }) => <Icon size={22} source="account-circle-outline" color={color} />,
        }}
      />
    </Tab.Navigator>
    
  );
};

const App = () => {

  const [user, dispatch] = useReducer(MyUserReducer, null);
  // const { showAlert } = useAlert()
  const loadUser = async () => {
    try {
      const savedStr = await SecureStore.getItemAsync("user");
      const saved = savedStr ? JSON.parse(savedStr) : null;

      console.log("Saved user loaded:", saved);

      if (saved === null) return;

      const isExpired = Date.now() >= saved.tokenExpiresAt;

      if (isExpired) {
        await createPublic(
          endpoints.login,
          {
            refresh_token: saved.refresh_token,
            client_id: CLIENT_ID_APP,
            client_secret: CLIENT_SECRET_APP,
            grant_type: "refresh_token",
          },
          async (data) => {
            const updated = {
              ...saved,
              refresh_token: data.refresh_token,
              tokenExpiresAt: Date.now() + data.expires_in * 1000,
            };
            await AsyncStorage.setItem("access_token", data.access_token);
            SecureStore.setItemAsync("user", JSON.stringify(updated));
            dispatch({ type: "LOGIN", payload: updated });
          },
          (err) => {
            SecureStore.deleteItemAsync("user");
            dispatch({ type: "LOGOUT" });
            // showAlert({
            //   type: 'info',
            //   title: 'Xác nhận',
            //   message: 'Bạn đã hết phiên đăng nhập vui lòng đăng nhập lại để tiếp tực xử dụng dv?',
            //   actions: [
            //     {
            //       text: 'Hủy',
            //       style: 'cancel'
            //     },
            //     {
            //       text: 'Đăng nhặp',
            //       onPress: () => {
            //         navigation.navigate("User", {
            //           screen: "Login"
            //         })
            //       },
            //     },
            //   ],
            // })
          }
        );
      } else {
        console.log("Token hợp lệ, đăng nhập tự động");
        dispatch({ type: "LOGIN", payload: saved });
      }

    } catch (err) {
      console.error("loadUser error:", err);
      dispatch({ type: "LOGOUT" });
    }
  };

  useEffect(() => {
    loadUser();
  }, [])


  return (
    <SafeAreaProvider>
      <MyUserContext.Provider value={{ user, dispatch }}>
        <SnackbarProvider>
          <NavigationContainer>
            <AlertProvider>
              <TabNavigatior />
            </AlertProvider>
          </NavigationContainer>
        </SnackbarProvider>
      </MyUserContext.Provider>
    </SafeAreaProvider>
  );
}

export default App;
