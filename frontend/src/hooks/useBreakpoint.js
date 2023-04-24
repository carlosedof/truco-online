import {useState, useEffect} from 'react';
import _ from "lodash";

const getDeviceConfig = (width) => {
    return width <= 1024;
    // if(width < 320) {
    //     return 'xs';
    // } else if(width >= 320 && width < 768 ) {
    //     return 'sm';
    // } else if(width >= 768 && width < 1150) {
    //     return 'md';
    // } else if(width >= 1151) {
    //     return 'lg';
    // }
};

const useBreakpoint = () => {
    const [brkPnt, setBrkPnt] = useState(() => getDeviceConfig(window.innerWidth));
    useEffect(() => {
        const calcInnerWidth = _.throttle(function() {
            setBrkPnt(getDeviceConfig(window.innerWidth))
        }, 200);
        window.addEventListener('resize', calcInnerWidth);
        return () => window.removeEventListener('resize', calcInnerWidth);
    }, []);
    return {isMobile: brkPnt};
};

export default useBreakpoint;
