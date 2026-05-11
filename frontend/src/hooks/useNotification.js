import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const useNotification = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user && user.token) {
            fetchNotifications();
            const newSocket = io('http://localhost:5000');
            setSocket(newSocket);

            newSocket.on('new_notification', (data) => {
                setNotifications(prev => [data, ...prev]);
                if (Notification.permission === 'granted') {
                    new Notification('AlumniConnect', { body: data.message });
                }
            });

            return () => newSocket.close();
        }
    }, [user]);

    const fetchNotifications = async () => {
        if (!user?.token) return;
        try {
            const { data } = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return { notifications, setNotifications };
};

export default useNotification;
