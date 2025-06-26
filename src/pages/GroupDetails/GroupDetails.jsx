import { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { auth } from '../../auth/firebaseConfig';
import GroupAdminPanel from '../GroupAdmin/GroupAdminPanel';
import NewPostForm from '../../components/NewPostForm';
import FeedList from '../../components/FeedList';
import Spinner from '../../components/Spinner';
import { FaEdit, FaUsers, FaCrown } from 'react-icons/fa';
import './GroupDetails.css';

export default function GroupDetails({ groupId, currentUserId }) {
    const [group, setGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    const [mongoUser, setMongoUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const hdr = () => ({ headers: { 'x-user-id': auth.currentUser?.uid } });

    useEffect(() => {
        const loadData = async () => {
            if (!groupId) return;
            
            try {
                setLoading(true);
                
                const [groupRes, postsRes, userRes] = await Promise.all([
                    axios.get(`/groups/${groupId}`, hdr()),
                    axios.get(`/posts/group/${groupId}`, hdr()),
                    axios.get('/users/me', hdr())
                ]);
                
                setGroup(groupRes.data);
                setPosts(postsRes.data.data || postsRes.data || []);
                setMongoUser(userRes.data);
                
            } catch (error) {
                console.error('Error loading group data:', error);
                if (error.response?.status === 403) {
                    alert('You must be a member to view this group');
                } else if (error.response?.status === 404) {
                    alert('Group not found');
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [groupId]);

    const isManager = group?.managers?.some(manager => {
        if (typeof manager === 'object') {
            return manager._id === currentUserId;
        }
        return manager === currentUserId;
    }) || false;

    const isCreator = group?.creator?._id === currentUserId || group?.creator === currentUserId;

    const canEdit = isManager || isCreator;

    const handleNewPost = (newPost) => {
        const enrichedPost = {
            ...newPost,
            author: mongoUser,
            groupId: {
                _id: group._id,
                name: group.name,
                image: group.image
            }
        };
        setPosts(prev => [enrichedPost, ...prev]);
    };

    const handlePostUpdated = (postId, newContent) => {
        setPosts(prev => 
            prev.map(p => p._id === postId ? { ...p, content: newContent } : p)
        );
    };

    const handlePostDeleted = (postId) => {
        setPosts(prev => prev.filter(p => p._id !== postId));
    };

    const handleGroupUpdated = (updatedGroup) => {
        setGroup(updatedGroup);
        setShowEditModal(false);
    };

    if (loading) return <Spinner />;
    if (!group) return <div className="gd-error">Group not found</div>;

    return (
        <div className="gd-page">
            <div className="gd-header">
                <div className="gd-header-image">
                    <img 
                        src={group.image || '/default-avatar.png'} 
                        alt={group.name}
                        className="gd-group-image"
                    />
                </div>
                
                <div className="gd-header-info">
                    <div className="gd-title-row">
                        <h1 className="gd-group-name">{group.name}</h1>
                        {canEdit && (
                            <button 
                                className="gd-edit-btn"
                                onClick={() => setShowEditModal(true)}
                                title="Edit Group"
                            >
                                <FaEdit />
                            </button>
                        )}
                    </div>
                    
                    <p className="gd-group-description">{group.description}</p>
                    
                    <div className="gd-stats">
                        <div className="gd-stat">
                            <FaUsers className="gd-stat-icon" />
                            <span>{group.membersCount || group.members?.length || 0} Members</span>
                        </div>
                        
                        {(isManager || isCreator) && (
                            <div className="gd-stat">
                                <FaCrown className="gd-stat-icon" />
                                <span>{isCreator ? 'Creator' : 'Manager'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="gd-content">
                {mongoUser && (
                    <div className="gd-new-post">
                        <NewPostForm 
                            mongoUser={mongoUser}
                            onPostCreated={handleNewPost}
                            groupId={group._id}
                        />
                    </div>
                )}

                <div className="gd-posts">
                    <FeedList
                        posts={posts}
                        mongoUser={mongoUser}
                        setPosts={setPosts}
                        onPostUpdated={handlePostUpdated}
                        onPostDeleted={handlePostDeleted}
                        isGroupAdmin={canEdit}
                        hideFilters={true}
                    />
                </div>
            </div>

            {showEditModal && (
                <div className="gd-modal-backdrop" onClick={() => setShowEditModal(false)}>
                    <div className="gd-modal-wrapper" onClick={e => e.stopPropagation()}>
                        <GroupAdminPanel
                            group={group}
                            onClose={() => setShowEditModal(false)}
                            onSaved={handleGroupUpdated}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}