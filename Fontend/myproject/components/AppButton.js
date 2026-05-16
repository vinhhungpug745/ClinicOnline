import React from 'react';
import { Button } from 'react-native-paper';
import COLORS from '../styles/Colors';
import { Animated} from 'react-native';


const BUTTON_CONFIGS = {
    // ─── Auth ─────────────────────────────────────────────
    login:    { icon: 'login',              label: 'Đăng nhập',    color: COLORS.btnPrimary },
    logout:   { icon: 'logout',             label: 'Đăng xuất',    color: COLORS.btnDanger  },
    register: { icon: 'account-plus',       label: 'Đăng ký',      color: COLORS.btnPrimary },

    // ─── CRUD ─────────────────────────────────────────────
    create:   { icon: 'plus-circle',        label: 'Tạo mới',      color: COLORS.btnPrimary },
    edit:     { icon: 'pencil',             label: 'Chỉnh sửa',    color: COLORS.btnWarning },
    delete:   { icon: 'trash-can',          label: 'Xóa',          color: COLORS.btnDanger  },
    save:     { icon: 'content-save',       label: 'Lưu',          color: COLORS.btnPrimary },
    cancel:   { icon: 'close-circle',       label: 'Hủy',          color: COLORS.btnDanger  },

    // ─── Điều hướng ───────────────────────────────────────
    detail:   { icon: 'eye',                label: 'Xem chi tiết', color: COLORS.btnPrimary },
    back:     { icon: 'arrow-left',         label: 'Quay lại',     color: COLORS.btnDisabled },
    next:     { icon: 'arrow-right',        label: 'Tiếp theo',    color: COLORS.btnPrimary },

    // ─── Y tế ─────────────────────────────────────────────
    book:     { icon: 'calendar-plus',      label: 'Đặt lịch',     color: COLORS.btnPrimary },
    confirm:  { icon: 'check-circle',       label: 'Xác nhận',     color: COLORS.success    },
    reject:   { icon: 'close-octagon',      label: 'Từ chối',      color: COLORS.btnDanger  },
    done:     { icon: 'check-all',          label: 'Hoàn thành',   color: COLORS.success    },
    pay:      { icon: 'credit-card',        label: 'Thanh toán',   color: COLORS.btnPrimary },
};

const AppButton = ({
    type = 'create',
    label,
    icon,
    loading = false,
    disabled = false,
    onPress,
    style,
    ...props
}) => {
    const config = BUTTON_CONFIGS[type];
    const scale = React.useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };
    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Button
                mode="contained"
                icon={icon ?? config.icon}
                loading={loading}
                disabled={disabled || loading}
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                buttonColor={config.color}
                style={[{ borderRadius: 18,paddingVertical: 2 , marginBottom: 15, marginHorizontal: 10}, style]}
                {...props}
            >
                {label ?? config.label}
            </Button>
        </Animated.View>
    );
};

export default AppButton;