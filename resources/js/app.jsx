// app.jsx
import "./bootstrap";
import "../css/app.css";
import axios from "axios";

// Import Chart.js globally to ensure it's properly bundled
import Chart from "chart.js/auto";
window.Chart = Chart; // Make it available globally if needed

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

// Set up axios defaults
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Get the CSRF token from the meta tag and set it for all requests
const token = document.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
    axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
} else {
    console.error("CSRF token not found");
}

const appName =
    window.document.getElementsByTagName("title")[0]?.innerText || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Ensure axios is available globally
        window.axios = axios;

        root.render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
    },
});
