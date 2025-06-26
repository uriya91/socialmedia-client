import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import './GroupManageUsers.css';

const FALLBACK = '/default-avatar.png';

export default function GroupManageUsers({ members, setMembers }) {
    const [q, setQ] = useState('');
    const [results, setR] = useState([]);

    useEffect(() => {
        if (q.length < 3) return setR([]);
        const t = setTimeout(() => {
            axios
                .get('/users', { params: { search: q } })
                .then(r => setR(r.data))
                .catch(console.error);
        }, 300);
        return () => clearTimeout(t);
    }, [q]);

    const toggleMember = u => {
        setMembers(ms =>
            ms.some(m => m._id === u._id)
                ? ms.filter(m => m._id !== u._id)
                : [...ms, { 
                    _id: u._id, 
                    username: u.username,
                    isAdmin: false, 
                    profileImage: u.profileImage 
                }]
        );
    };

    const toggleAdmin = id => {
        setMembers(ms =>
            ms.map(m =>
                m._id === id ? { ...m, isAdmin: !m.isAdmin } : m
            )
        );
    };

    const removeMember = (memberId) => {
        setMembers(ms => ms.filter(m => m._id !== memberId));
    };

    return (
        <section className="gm-manage">
            <input
                className="gm-input"
                placeholder="Search user…"
                value={q}
                onChange={e => setQ(e.target.value)}
            />

            <div className="gm-results">
                {results.map(u => {
                    const joined = members.some(m => m._id === u._id);
                    return (
                        <div key={u._id} className="gm-result-item">
                            <img
                                className="gm-avatar"
                                src={u.profileImage || FALLBACK}
                                alt={u.username}
                            />
                            <span className="gm-name">{u.username}</span>
                            <button
                                className="gm-action"
                                onClick={() => toggleMember(u)}>
                                {joined ? 'Remove' : 'Add'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <ul className="gm-list">
                {members.map(m => (
                    <li key={m._id} className="gm-member-item">
                        <img
                            className="gm-avatar"
                            src={m.profileImage || FALLBACK}
                            alt={m.username}
                        />
                        <span className="gm-name">{m.username}</span>
                        {m.isAdmin && <span className="gm-badge">Admin</span>}
                        <button
                            className="gm-admin-btn"
                            onClick={() => toggleAdmin(m._id)}>
                            {m.isAdmin ? 'Demote' : 'Promote'}
                        </button>
                        <button
                            className="gm-remove-btn"
                            onClick={() => removeMember(m._id)}>
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}