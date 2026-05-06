// utils/apiHelper.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { authApis, endpoints } from "../configs/Apis";

const handleError = (err, onError) => {
    const status = err.response?.status;
    const errData = err.response?.data;

    if (status >= 400 && status < 500) {
        onError?.("client", err.response?.data?.detail || "Yêu cầu không hợp lệ.", errData);
    } else if (status >= 500) {
        onError?.("server", "Lỗi máy chủ. Vui lòng thử lại sau.");
    } else {
        onError?.("network", "Không thể kết nối. Kiểm tra lại mạng.");
    }

    console.error("API Error:", err.message || err);
};

// ============ CÓ AUTH ============

export const fetchWithAuth = async (endpoint, onSuccess, onError, params = {}, setLoading) => {
    setLoading?.(true);
    try {
        const token = await AsyncStorage.getItem("access_token");
        let res = await authApis(token).get(endpoint, { params });
        if (res.status === 200) onSuccess(res.data);
    } catch (err) { handleError(err, onError); }
    finally { setLoading?.(false); }
};

export const createWithAuth = async (endpoint, body, onSuccess, onError, setLoading) => {
    setLoading?.(true);
    try {
        const token = await AsyncStorage.getItem("access_token");
        let res = await authApis(token).post(endpoint, body);
        if (res.status === 200 || res.status === 201) onSuccess(res.data);
    } catch (err) { handleError(err, onError); }
    finally { setLoading?.(false); }
};

export const updateWithAuth = async (endpoint, body, onSuccess, onError, setLoading) => {
    setLoading?.(true);
    try {
        const token = await AsyncStorage.getItem("access_token");
        let res = await authApis(token).put(endpoint, body);
        if (res.status === 200) onSuccess(res.data);
    } catch (err) { handleError(err, onError); }
    finally { setLoading?.(false); }
};

export const deleteWithAuth = async (endpoint, onSuccess, onError, setLoading) => {
    setLoading?.(true);
    try {
        const token = await AsyncStorage.getItem("access_token");
        let res = await authApis(token).delete(endpoint);
        if (res.status === 200 || res.status === 204) onSuccess();
    } catch (err) { handleError(err, onError); }
    finally { setLoading?.(false); }
};

// ============ KHÔNG AUTH ============

export const fetchPublic = async (endpoint, onSuccess, onError, params = {}, setLoading) => {
    setLoading?.(true);
    try {
        let res = await Apis.get(endpoint, { params });
        if (res.status === 200)
            onSuccess(res.data.results ?? res.data, res.data.next);
    } catch (err) { handleError(err, onError); }
    finally { setLoading?.(false); }
};

export const createPublic = async (endpoint, body, onSuccess, onError, headers = {}, onFinally, setLoading) => {
    setLoading?.(true);
    try {
        let res = await Apis.post(endpoint, body, { headers });
        if (res.status === 200 || res.status === 201) onSuccess(res.data);
    } catch (err) { handleError(err, onError); }
    finally {
        onFinally?.();
        setLoading?.(false);
    }
};