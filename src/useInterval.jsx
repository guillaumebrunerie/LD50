import * as React from "react";

export const useInterval = (callback, interval) => {
    const cbRef = React.useRef();
    React.useEffect(() => {
        cbRef.current = callback;
    }, [callback]);
    React.useEffect(() => {
        const id = setInterval(() => { cbRef.current(); }, interval);
        return () => clearInterval(id);
    }, [interval]);
};
