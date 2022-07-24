import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client';
import App from "./App";

const root = createRoot(
    document.getElementById("root")!
);

root.render(
    <React.StrictMode>
        <HashRouter>
            <App />
        </HashRouter>
    </React.StrictMode>
);