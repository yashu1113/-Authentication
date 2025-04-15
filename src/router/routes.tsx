import { lazy } from 'react';
import Register from '../pages/RegisterBoxed';
import LoginBoxed from '../pages/LoginBoxed';
import ProtectedRoute from '../pages/protectroute';
import Logout from '../pages/Logout';

const Index = lazy(() => import('../pages/Index'));

const routes = [
    {
        path: '/',
        element: <LoginBoxed />,
        layout: 'blank',
    },
    {
        path: '/SignUp',
        element: <Register />,
        layout: 'blank',
    },
    {
        path: '/index',
        element: (
            <ProtectedRoute>
                <Index />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
];

export { routes };
