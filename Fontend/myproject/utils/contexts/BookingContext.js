// BookingContext.jsx
import { createContext, useContext, useReducer } from "react";
import BookingReducer, { initialState } from "../reducers/BookingReducer";

const BookingContext = createContext();

const BookingProvider = ({ user, children }) => {
    const [bookingData, dispatch] = useReducer(BookingReducer,{ ...initialState, patient: user });

    const updateBooking = (key, value) =>
        dispatch({ type: "UPDATE_FIELD", key, value });

    const updateBulk = (value) =>
        dispatch({ type: "UPDATE_BULK", value });

    const updatePatient = (key, value) =>
        dispatch({ type: "UPDATE_PATIENT", key, value });

    const updateProfile = (key, value) =>
        dispatch({ type: "UPDATE_PROFILE", key, value });

    return (
        <BookingContext.Provider value={{
            bookingData,
            dispatch,
            updateBooking,
            updateBulk,
            updatePatient,
            updateProfile,
            resetAll: () => dispatch({ type: "RESET_ALL" })
        }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => useContext(BookingContext);

export default BookingProvider;