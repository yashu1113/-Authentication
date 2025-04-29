import { lazy } from 'react';
import Register from '../pages/RegisterBoxed';
import LoginBoxed from '../pages/LoginBoxed';
import ProtectedRoute from '../pages/protectroute';
import Logout from '../pages/Logout';
import Chat from '../../chat';
import Mailbox from '../../Mailbox';
import TodoList from '../../Todolist';
import Notes from '../../Notes';
import Scrumboard from '../../Scrumboard';
import Contacts from '../../Contacts';
import calendar from '../../calendar';
import { Calendar } from 'fullcalendar';
import FullCalendar from '@fullcalendar/react';
import UserList from '../../Userlist';
import UserProfile from '../../UserProfile';

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

    {
        path: '/chat',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <Chat />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/mailbox',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <Mailbox />,
            </ProtectedRoute>
        ),
        layout: 'default',
    },

    {
        path: '/todolist',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <TodoList />,
            </ProtectedRoute>
        ),

        layout: 'default',
    },

    {
        path: '/notes',
        element: <Notes />,
        layout: 'default',
    },

    {
        path: '/scrumboard',
        element: <Scrumboard />,
        layout: 'default',
    },

    {
        path: '/contacts',
        element: <Contacts />,
        layout: 'default',
    },

    {
        path: '/calendar',
        element: <FullCalendar />,
        layout: 'default',
    },

    {
        path: '/userlist',
        element: <UserList />,
        layout: 'default',
    },

    {
        path: '/userprofile',
        element: (
            <ProtectedRoute>
                <UserProfile />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '*',
        element: (
            <ProtectedRoute>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h1>404 - Page Not Found</h1>
                    <p>The page you are looking for does not exist.</p>
                </div>
            </ProtectedRoute>
        ),
        layout: 'default',
    },
];

export { routes };
