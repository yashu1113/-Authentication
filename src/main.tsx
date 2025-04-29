import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from './contexts/UserContext';
import { Provider } from 'react-redux';
import store from './store/index';
import { RouterProvider } from 'react-router-dom';
import router from './router/index';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './tailwind.css';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <UserProvider>
                <RouterProvider router={router} />
                <ToastContainer />
            </UserProvider>
        </Provider>
    </React.StrictMode>
);
