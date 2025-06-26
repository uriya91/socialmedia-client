import { useEffect, useState, useRef, useCallback } from 'react';
import axios from '../../utils/axiosConfig';
import Spinner from '../../components/Spinner';

import MyGroupSpinner from './MyGroupSpinner';
import GroupList from './GroupList';
import GroupAdminPanel from '../GroupAdmin/GroupAdminPanel';

import './Groups.css';

export default function Groups({ currentUserId, onGroupSelect }) {
  const [myGroups, setMyGroups] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: my }, { data: all }] = await Promise.all([
          axios.get('/groups/my'),
          axios.get('/groups/all', { params: { page: 1, limit: 16 } }),
        ]);
        
        setMyGroups(my.data);
        setDiscover(all.data);
        setHasMore(all.hasMore);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sentinel = useRef();
  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    try {
      const { data } = await axios.get('/groups/all', {
        params: { page: page + 1, limit: 16 },
      });
      setDiscover(d => [...d, ...data.data]);
      setPage(p => p + 1);
      setHasMore(data.hasMore);
    } catch (e) {
      console.error(e);
    }
  }, [page, hasMore]);
  
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) loadMore();
      },
      { threshold: 1 }
    );
    if (sentinel.current) io.observe(sentinel.current);
    return () => io.disconnect();
  }, [loadMore]);

  const patch = g => {
    setDiscover(lst => lst.map(x => (x._id === g._id ? g : x)));
    const iAmMember = Array.isArray(g.members) && g.members.includes(currentUserId);
    setMyGroups(lst => {
      if (iAmMember) {
        return lst.some(x => x._id === g._id)
          ? lst.map(x => (x._id === g._id ? g : x))
          : [...lst, g];
      } else {
        return lst.filter(x => x._id !== g._id);
      }
    });
  };

  const join = id =>
    axios.post(`/groups/${id}/join`).then(({ data }) => patch(data));
  const cancel = id =>
    axios.delete(`/groups/${id}/join`).then(({ data }) => patch(data));
  const leave = id =>
    axios
      .delete(`/groups/${id}/members/${currentUserId}`)
      .then(({ data }) => patch(data));

  const handleCreatedOrUpdated = g => patch(g);

  const handleGroupSelect = (groupId) => {
    if (onGroupSelect) {
      onGroupSelect(groupId);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="groups-page">
      <h3 className="mg-title">My Magical Groups</h3>
      <MyGroupSpinner
        groups={myGroups}
        onLeave={leave}
        onCreate={() => setEditingGroup({})}
        onEdit={g => setEditingGroup(g)}
        onGroupSelect={handleGroupSelect}
        currentUserId={currentUserId}
      />

      <h3 className="discover-title">Discover Magical Groups</h3>
      <GroupList
        groups={discover}
        myGroupIds={new Set(myGroups.map(g => g._id))}
        currentUserId={currentUserId}
        onJoin={join}
        onCancel={cancel}
        onLeave={leave}
        onGroupSelect={handleGroupSelect}
      />
      <div ref={sentinel} style={{ height: 1 }} />

      {editingGroup !== null && (
        <div className="modal-backdrop" onClick={() => setEditingGroup(null)}>
          <div className="modal-wrapper" onClick={e => e.stopPropagation()}>
            <GroupAdminPanel
              group={editingGroup._id ? editingGroup : null}
              onClose={() => setEditingGroup(null)}
              onSaved={handleCreatedOrUpdated}
            />
          </div>
        </div>
      )}
    </div>
  );
}