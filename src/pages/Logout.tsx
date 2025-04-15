import { useNavigate } from 'react-router-dom';
import IconLogout from '../components/Icon/IconLogout';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/'); // Redirect to login
    };

    return (
        <li className="border-t border-white-light dark:border-white-light/10">
            <button onClick={handleLogout} className="text-danger !py-3 w-full text-left flex items-center hover:text-primary dark:hover:text-white">
                <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
                Sign Out
            </button>
        </li>
    );
};

export default LogoutButton;
