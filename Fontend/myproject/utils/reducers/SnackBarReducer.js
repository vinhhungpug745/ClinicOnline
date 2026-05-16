export const initialState = {
    visible: false,
    message: "",
    sub: "",
    type: "success",
    duration: 3000,
};

const SnackBarReducer = (state, action) => {
    switch (action.type) {
        case "SHOW":
            return { ...state, visible: true, ...action.payload };
        case "HIDE":
            return { ...state, visible: false };
        default:
            return state;
    }
};

export default SnackBarReducer;