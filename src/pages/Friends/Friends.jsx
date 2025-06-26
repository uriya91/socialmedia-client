import { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { auth } from '../../auth/firebaseConfig';

import FriendsGrid from './FriendsGrid';
import PendingRequestsSlider from './PendingRequestsSlider';
import Spinner from '../../components/Spinner';
import './Friends.css';

export default function Friends({ onSelectFriend }) {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const hdr = () => ({ headers: { 'x-user-id': auth.currentUser?.uid } });

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        Promise.all([
            axios.get('/users/me/friends', hdr()),
            axios.get('/users/me/requests', hdr())
        ])
            .then(([fRes, rRes]) => {
                setFriends(fRes.data);
                setRequests(rRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const remove = id => axios
        .delete(`/users/${id}/friend-remove`, hdr())
        .then(() => setFriends(prev => prev.filter(f => f._id !== id)));

    const accept = id => axios
        .post(`/users/${id}/friend-accept`, {}, hdr())
        .then(() => {
            setRequests(prev => prev.filter(r => r._id !== id));
            setFriends(prev => [...prev, requests.find(r => r._id === id)]);
        });

    const decline = id => axios
        .post(`/users/${id}/friend-cancel`, {}, hdr())
        .then(() => setRequests(prev => prev.filter(r => r._id !== id)));

    if (loading) return <Spinner />;

    return (
        <div className="friends-wrapper">
            <PendingRequestsSlider
                requests={requests}
                onAccept={accept}
                onDecline={decline}
            />

            <FriendsGrid
                friends={friends}
                onRemove={remove}
                onSelect={onSelectFriend}
            />
        </div>
    );
}