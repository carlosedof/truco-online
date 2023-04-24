import {Fragment} from "react";
import {createRoot} from "react-dom/client";

import RoutesApp from "./routes";
import './index.css'

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
    <Fragment>
        <RoutesApp />
    </Fragment>
);
