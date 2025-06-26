import React, { useState, useEffect } from "react";
import axios from "../utils/axiosConfig";
import CommentSection from "./CommentSection";
import { auth } from "../auth/firebaseConfig";
import "./FeedPostItem.css";

const FeedPostItem = ({ post, mongoUser, onPostUpdated, onPostDeleted, isGroupAdmin = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(post.content);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [hasLiked, setHasLiked] = useState(post.likes?.includes(mongoUser._id));
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isAuthor = mongoUser._id === post.author._id;
  const canEdit = isAuthor;
  const canDelete = isAuthor || isGroupAdmin;

  const profileImage = post.author?.profileImage || "/default-avatar.png";

  const hdr = () => ({
    headers: { "x-user-id": auth.currentUser?.uid },
  });

  useEffect(() => {
    const fetchCommentCount = async () => {
      if (post.commentsCount !== undefined) return;
      
      try {
        setLoadingComments(true);
        const res = await axios.get(`/comments/post/${post._id}`, hdr());
        setCommentsCount(res.data.length);
      } catch (err) {
        console.error("Failed to fetch comment count", err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchCommentCount();
  }, [post._id]);

  const toggleLike = async () => {
    try {
      await axios.post(`/posts/${post._id}/like`, {}, hdr());
      setHasLiked((prev) => !prev);
      setLikesCount((prev) => (hasLiked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleUpdate = async () => {
    if (!newContent.trim()) {
      alert("Content cannot be empty");
      return;
    }
    
    try {
      setUpdating(true);
      await axios.put(`/posts/${post._id}`, { content: newContent.trim() }, hdr());
      setIsEditing(false);
      onPostUpdated?.(post._id, newContent.trim());
    } catch (err) {
      console.error("Failed to update post", err);
      alert("Failed to update post. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmMessage = isAuthor 
      ? "Are you sure you want to delete this post?" 
      : "Delete this post as group admin?";
      
    if (!window.confirm(confirmMessage)) return;
    
    try {
      await axios.delete(`/posts/${post._id}`, hdr());
      onPostDeleted?.(post._id);
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  const updateCommentsCount = (count) => {
    setCommentsCount(count);
  };

  return (
    <div className="hp-post">
      <div className="hp-post__header">
        <img 
          className="hp-profile-img" 
          src={profileImage} 
          alt="profile"
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
        <div className="hp-post__user">{post.author?.username}</div>
        
        <div className="hp-post__actions">
          {canEdit && !isEditing && (
            <button
              className="hp-icon hp-icon--edit"
              onClick={() => setIsEditing(true)}
              disabled={updating}
              title="Edit post"
            >
              ✎
            </button>
          )}
          
          {canDelete && (
            <button
              className="hp-icon hp-icon--delete"
              onClick={handleDelete}
              title={isAuthor ? "Delete post" : "Delete post (Admin)"}
            >
              ✖
            </button>
          )}
          
          {!canEdit && !canDelete && (
            <div className="hp-icon--spacer"></div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="hp-post__edit-section">
          <textarea
            className="hp-post__edit"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={updating}
            maxLength={300}
          />
          <div className="hp-post__edit-actions">
            <button 
              className="hp-save-button" 
              onClick={handleUpdate}
              disabled={updating || !newContent.trim()}
            >
              {updating ? "Saving..." : "Save"}
            </button>
            <button 
              className="hp-cancel-button" 
              onClick={() => {
                setIsEditing(false);
                setNewContent(post.content);
              }}
              disabled={updating}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="hp-post__content">{post.content}</div>
      )}

      <div className="hp-post__footer">
        <div className="hp-post__footer-left">
          <span>
            {likesCount} Like{likesCount !== 1 ? 's' : ''} • {' '}
            {loadingComments ? "..." : commentsCount} Comment{commentsCount !== 1 ? 's' : ''}
          </span>
          {post.groupId && (
            <span className="hp-post__group">
              📁 {post.groupId.name || 'Group'}
            </span>
          )}
        </div>
        
        <div className="hp-post__footer-right">
          <button className="hp-post__btn" onClick={toggleLike}>
            {hasLiked ? "❤️ Unlike" : "🤍 Like"}
          </button>
          <button
            className="hp-post__btn"
            onClick={() => setCommentsVisible((prev) => !prev)}
          >
            💬 {commentsVisible ? "Hide" : "Comments"}
          </button>
        </div>
      </div>

      {commentsVisible && (
        <CommentSection
          postId={post._id}
          mongoUser={mongoUser}
          onCommentChange={updateCommentsCount}
        />
      )}
    </div>
  );
};

export default FeedPostItem;