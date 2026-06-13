import React from "react";
import "../src/index.css";
import "@fontsource/league-spartan/700.css";
import "@fontsource/albert-sans/400.css";
import "@fontsource/albert-sans/500.css";
import "@fontsource/albert-sans/600.css";

export const Wrapper = ({ children }) => {
    // Set up theme for preview (defaulting to light mode)
    // You can manually add the 'dark' class to test dark mode
    React.useEffect(() => {
        const hour = new Date().getHours();
        const isNight = hour < 6 || hour >= 18;
        if (isNight) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    return <div className="bg-white dark:bg-oxford-blue min-h-screen p-8">{children}</div>;
};
