import React from "react";
import ReactDOM from "react-dom";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import CreateProduct from "./components/CreateProduct";
import ListProduct from "./components/ListProduct";



// require('./bootstrap');
// require('./sb-admin');



const getContext = (id) => {
    let context = {}
    const root = document.getElementById(id);
    if (root) {
        context = JSON.parse(root.textContent)
    }
    return context
}



const root = document.getElementById('root')

if (root) {
    const props = getContext("app-context")

    const router = createBrowserRouter([
        {
            path: "/product/create/",
            element: <CreateProduct {...props}/>,
        },
        {
            path: "/product/list/",
            element: <ListProduct {...props}/>,
        },
    ]);

    ReactDOM.render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>,
        root
    );
}
