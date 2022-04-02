import * as React from "react";

export const useWindowEventListener = (event, listener) => {
    React.useEffect(() => {
        window.addEventListener(event, listener);
        return () => window.removeEventListener(event, listener);
    }, [event, listener]);
};
