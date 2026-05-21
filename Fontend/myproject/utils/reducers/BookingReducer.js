export const initialState = {
    shift: "morning",
    slots: {},
    patient: null,
    specialty: null,
    doctor: null,
    serviceNormal: null,
};

const BookingReducer = (state, action) => {
    switch (action.type) {
        case "UPDATE_FIELD":
            return { ...state, [action.key]: action.value };

        case "UPDATE_BULK":
            return { ...state, ...action.value };

        case "UPDATE_PATIENT":
            return {
                ...state,
                patient: { ...state.patient, [action.key]: action.value }
            };

        case "UPDATE_PROFILE":
            return {
                ...state,
                patient: {
                    ...state.patient,
                    profile: { ...state.patient.profile, [action.key]: action.value }
                }
            };

        case "RESET_ALL":
            return {
                ...initialState,
                patient: action.value ? {
                    ...action.value,
                    profile: null,
                } : null
            };
        default:
            return state;
    }
};

export default BookingReducer;