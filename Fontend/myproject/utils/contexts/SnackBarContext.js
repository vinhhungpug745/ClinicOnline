import {createContext, useContext, useReducer} from "react";
import AppSnackbar from "../../components/AppSnackbar";
import SnackBarReducer, { initialState } from "../reducers/SnackBarReducer";

export const SnackBarContext = createContext();

export const useSnackbar = () => useContext(SnackBarContext);

const SnackbarProvider = ({ children }) => {
    const [state, dispatch] = useReducer(SnackBarReducer, initialState);

    const showSnackbar = (message, type = "success", sub = "", duration = 3000) => {
        dispatch({ type: "SHOW", payload: { message, type, sub, duration } });
    };

    const hideSnackbar = () => {
        dispatch({ type: "HIDE" });
    };

    return (
        <SnackBarContext.Provider value={{ showSnackbar, hideSnackbar }}>
            {children}
            <AppSnackbar
                visible={state.visible}
                message={state.message}
                sub={state.sub}
                type={state.type}
                duration={state.duration}
                onDismiss={hideSnackbar}
            />
        </SnackBarContext.Provider>
    );
};

export default SnackbarProvider;