import axios from "axios";
import {API_URL} from "@env"

const Base_URL = API_URL;

console.log(API_URL);

export const endpoints = {
    'doctors': '/doctors/',
    'workdayDetail': (id) => `/users/workday/${id}/`,
    'doctorDetail': (id) => `/doctors/${id}/`,
    'doctorWorkDay': (id) => `/doctors/${id}/doctor_workday/`,
    'doctorspecialty': (id) => `/specialtys/${id}/doctors/`,
    'specialty': '/specialtys/',
    'login': '/o/token/',
    'logout': '/o/revoke_token/',
    'profile': '/users/profile_user/',
    'register': '/users/',
    'appointments': '/appointments/',
    'appointmentDetail': (id) => `/appointments/${id}/`,
    'workday': '/users/workday_staff/',
    'updateworkday': (id) => `/users/workday/${id}/timeslots/`,
    'chatgemini': '/chatbox/'
}

export const authApis = (token) => {
    return axios.create({
        baseURL: Base_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};


export default axios.create({
    baseURL: Base_URL
});