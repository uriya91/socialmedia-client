import React, { useState, useEffect } from 'react'
import axios from '../../utils/axiosConfig'
import Spinner from '../../components/Spinner'
import './GroupAdminPanel.css'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'

export default function GroupAdminPanel({ group, onClose, onSaved }) {
    const isEdit = Boolean(group)
    const [tab, setTab] = useState('details')

    const [name, setName] = useState(group?.name || '')
    const [description, setDescription] = useState(group?.description || '')
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(group?.image || '')

    const [members, setMembers] = useState([])
    const [pending, setPending] = useState([])

    const [searchQ, setSearchQ] = useState('')
    const [results, setResults] = useState([])

    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (isEdit) {
            axios.get(`/groups/${group._id}`)
                .then(({ data }) => {
                    setMembers(
                        data.members.map(u => ({
                            _id: u._id,
                            username: u.username,
                            profileImage: u.profileImage,
                            isAdmin: data.managers.map(m => m._id).includes(u._id),
                        }))
                    )
                    setPending(
                        data.pendingJoinRequests.map(u => ({
                            _id: u._id,
                            username: u.username,
                            profileImage: u.profileImage,
                        }))
                    )
                })
                .catch(console.error)
        } else {
            axios.get('/users/me')
                .then(({ data }) =>
                    setMembers([{
                        _id: data._id,
                        username: data.username,
                        profileImage: data.profileImage,
                        isAdmin: true,
                    }])
                )
                .catch(console.error)
        }
    }, [isEdit, group?._id])

    useEffect(() => {
        if (!imageFile) return
        const url = URL.createObjectURL(imageFile)
        setImagePreview(url)
        return () => URL.revokeObjectURL(url)
    }, [imageFile])

    useEffect(() => {
        if (searchQ.length < 3) {
            setResults([])
            return
        }
        const handle = setTimeout(() => {
            axios.get('/users', { 
                params: { search: searchQ }
            })
                .then(r => setResults(r.data))
                .catch(console.error)
        }, 300)
        return () => clearTimeout(handle)
    }, [searchQ])

    const toggleMember = async (user) => {
        const isCurrentlyMember = members.some(m => m._id === user._id)
        
        if (!isEdit) {
            if (isCurrentlyMember) {
                setMembers(ms => ms.filter(m => m._id !== user._id))
            } else {
                setMembers(ms => [...ms, { 
                    _id: user._id, 
                    username: user.username, 
                    profileImage: user.profileImage,
                    isAdmin: false 
                }])
            }
            return
        }
        
        try {
            if (isCurrentlyMember) {
                await axios.delete(`/groups/${group._id}/members/${user._id}`)
                
                setMembers(ms => ms.filter(m => m._id !== user._id))
            } else {
                await axios.patch(`/groups/${group._id}/members/${user._id}`, {
                    role: 'user'
                })
                
                setMembers(ms => [...ms, { 
                    _id: user._id, 
                    username: user.username, 
                    profileImage: user.profileImage,
                    isAdmin: false 
                }])
            }
        } catch (err) {
            console.error('Error updating member:', err)
            alert('Failed to update member. Please try again.')
        }
    }

    const toggleAdmin = async (userId) => {
        const member = members.find(m => m._id === userId)
        if (!member) return
        
        if (!isEdit) {
            setMembers(ms =>
                ms.map(m => m._id === userId ? { ...m, isAdmin: !m.isAdmin } : m)
            )
            return
        }
        
        const newRole = member.isAdmin ? 'user' : 'admin'
        
        try {
            await axios.patch(`/groups/${group._id}/members/${userId}`, {
                role: newRole
            })
            
            setMembers(ms =>
                ms.map(m => m._id === userId ? { ...m, isAdmin: !m.isAdmin } : m)
            )
        } catch (err) {
            console.error('Error updating member role:', err)
            alert('Failed to update member role. Please try again.')
        }
    }

    const removeMember = async (userId) => {
        if (!isEdit) {
            setMembers(ms => ms.filter(m => m._id !== userId))
            return
        }
        
        try {
            await axios.delete(`/groups/${group._id}/members/${userId}`)
            setMembers(ms => ms.filter(m => m._id !== userId))
        } catch (err) {
            console.error('Error removing member:', err)
            alert('Failed to remove member. Please try again.')
        }
    }

    const respond = async (userId, accept) => {
        try {
            await axios.patch('/groups/join/respond', {
                groupId: group._id,
                userId,
                accept,
            })

            if (accept) {
                const approvedUser = pending.find(u => u._id === userId)
                if (approvedUser) {
                    setMembers(prev => [...prev, {
                        _id: approvedUser._id,
                        username: approvedUser.username,
                        profileImage: approvedUser.profileImage,
                        isAdmin: false,
                    }])
                }
            }
            
            setPending(prev => prev.filter(u => u._id !== userId))

            const remainingRequests = pending.filter(u => u._id !== userId)
            if (remainingRequests.length === 0) {
                setTab('members')
            }

        } catch (err) {
            console.error('Error responding to join request:', err)
            alert('Failed to process request. Please try again.')
        }
    }

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Name is required')
            return
        }
        
        setSaving(true)
        try {
            const imgUrl = imageFile
                ? await uploadToCloudinary(imageFile)
                : imagePreview

            const { data: updatedGroup } = isEdit
                ? await axios.put(`/groups/${group._id}`, { 
                      name, 
                      description, 
                      image: imgUrl 
                  })
                : await axios.post('/groups', { 
                      name, 
                      description, 
                      image: imgUrl 
                  })

            if (!isEdit) {
                const additionalMembers = members.filter(m => !m.isAdmin)
                
                for (const member of additionalMembers) {
                    try {
                        await axios.patch(`/groups/${updatedGroup._id}/members/${member._id}`, {
                            role: 'user'
                        })
                    } catch (err) {
                        console.error(`Error adding member ${member.username}:`, err)
                    }
                }
                
                const adminMembers = members.filter(m => m.isAdmin && m._id !== updatedGroup.creator)
                
                for (const admin of adminMembers) {
                    try {
                        await axios.patch(`/groups/${updatedGroup._id}/members/${admin._id}`, {
                            role: 'admin'
                        })
                    } catch (err) {
                        console.error(`Error promoting admin ${admin.username}:`, err)
                    }
                }
            }

            const { data: fullGroup } = await axios.get(`/groups/${updatedGroup._id}`)
            
            onSaved(fullGroup)
            onClose()
        } catch (err) {
            console.error('Error saving group:', err)
            alert('Failed to save group. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="ga-card">
            {saving && (
                <div className="ga-spinner-overlay">
                    <Spinner />
                </div>
            )}

            <h3>{isEdit ? 'Edit Group' : 'Create New Group'}</h3>
            <div className="ga-tabs">
                <button
                    className={tab === 'details' ? 'active' : ''}
                    onClick={() => setTab('details')}
                >Details</button>
                <button
                    className={tab === 'members' ? 'active' : ''}
                    onClick={() => setTab('members')}
                >Members ({members.length})</button>
                {isEdit && pending.length > 0 && (
                    <button
                        className={tab === 'requests' ? 'active' : ''}
                        onClick={() => setTab('requests')}
                    >Requests ({pending.length})</button>
                )}
            </div>

            {tab === 'details' && (
                <section className="ga-edit">
                    <label>Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        maxLength={100}
                    />

                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        maxLength={500}
                    />

                    <label>Image</label>
                    {imagePreview && <img src={imagePreview} alt="preview" />}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setImageFile(e.target.files[0])}
                    />
                </section>
            )}

            {tab === 'members' && (
                <section className="gm-manage">
                    <input
                        className="gm-input"
                        placeholder="Search user…"
                        value={searchQ}
                        onChange={e => setSearchQ(e.target.value)}
                    />

                    {results.length > 0 && (
                        <div className="gm-results">
                            {results.map(u => {
                                const joined = members.some(m => m._id === u._id)
                                return (
                                    <div key={u._id} className="gm-result-item">
                                        <img
                                            className="gm-avatar"
                                            src={u.profileImage || '/default-avatar.png'}
                                            alt={u.username}
                                        />
                                        <span className="gm-name">{u.username}</span>
                                        <button
                                            className="gm-action"
                                            onClick={() => toggleMember(u)}
                                        >
                                            {joined ? 'Remove' : 'Add'}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <div className="gm-list">
                        <h4 style={{color: 'gold', margin: '1rem 0 0.5rem', fontSize: '1.1rem'}}>
                            Current Members ({members.length})
                        </h4>
                        {members.map(m => (
                            <div key={m._id} className="gm-member-item">
                                <img
                                    className="gm-avatar"
                                    src={m.profileImage || '/default-avatar.png'}
                                    alt={m.username}
                                />
                                <span className="gm-name">
                                    {m.username}{m.isAdmin && ' (Admin)'}
                                </span>
                                <button
                                    className="gm-admin-btn"
                                    onClick={() => toggleAdmin(m._id)}
                                    disabled={members.filter(mem => mem.isAdmin).length === 1 && m.isAdmin}
                                >
                                    {m.isAdmin ? 'Demote' : 'Promote'}
                                </button>
                                <button
                                    className="gm-remove-btn"
                                    onClick={() => removeMember(m._id)}
                                    disabled={members.length === 1}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {tab === 'requests' && isEdit && (
                <section className="gm-manage">
                    <h4 style={{color: 'gold', margin: '0 0 1rem', fontSize: '1.1rem'}}>
                        Pending Join Requests ({pending.length})
                    </h4>
                    {pending.length === 0 ? (
                        <p style={{color: '#888', textAlign: 'center', padding: '2rem'}}>
                            No pending requests
                        </p>
                    ) : (
                        <div className="gm-pending-list">
                            {pending.map(u => (
                                <div key={u._id} className="gm-pending-item">
                                    <img
                                        className="gm-avatar"
                                        src={u.profileImage || '/default-avatar.png'}
                                        alt={u.username}
                                    />
                                    <span className="gm-name">{u.username}</span>
                                    <button
                                        className="gm-action"
                                        onClick={() => respond(u._id, true)}
                                        style={{backgroundColor: '#1b5e20'}}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="gm-action"
                                        onClick={() => respond(u._id, false)}
                                        style={{backgroundColor: '#c62828'}}
                                    >
                                        Reject
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            <div className="ga-actions">
                <button onClick={onClose}>Cancel</button>
                <button onClick={handleSave} disabled={!name.trim()}>
                    {isEdit ? 'Save Changes' : 'Create Group'}
                </button>
            </div>
        </div>
    )
}