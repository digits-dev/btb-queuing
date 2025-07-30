import { useState, useEffect } from "react";

export default function RealTimeClock() {
    const [time, setTime] = useState(getFormattedTime());

    function getFormattedTime() {
        const now = new Date();
        return now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(getFormattedTime());
        }, 1000); 

        return () => clearInterval(interval);
    }, []);

    return <span>{time}&nbsp;&nbsp;</span>;
}
