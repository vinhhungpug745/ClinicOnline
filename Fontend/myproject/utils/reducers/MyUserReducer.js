export default (current, acction) => {
    switch (acction.type) {
        case "LOGIN":
            return acction.payload;
        case "UPDATE":
            return { ...current, ...acction.payload };
        case "LOGOUT":
            return null;
    }
    return current;
}