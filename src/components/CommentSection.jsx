import React, { useEffect, useState } from "react";
import axios from "../utils/axiosConfig";
import { auth } from "../auth/firebaseConfig";
import Spinner from "./Spinner";
import "./CommentSection.css";

const CommentSection = ({ postId, mongoUser, onCommentChange }) => {
  const [comments, setComments] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingStates, setEditingStates] = useState({});

  const hdr = () => ({
    headers: { "x-user-id": auth.currentUser?.uid },
  });

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/comments/post/${postId}`, hdr());
      setComments(res.data);
      onCommentChange?.(res.data.length);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await axios.post(
        "/comments",
        { postId, content: newContent },
        hdr()
      );
      const updated = [...comments, res.data.comment];
      setComments(updated);
      onCommentChange?.(updated.length);
      setNewContent("");
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await axios.delete(`/comments/${id}`, hdr());
      const updated = comments.filter((c) => c._id !== id);
      setComments(updated);
      onCommentChange?.(updated.length);
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleUpdateComment = async (id) => {
    const updatedContent = editingStates[id];
    try {
      await axios.put(`/comments/${id}`, { content: updatedContent }, hdr());
      setComments(
        comments.map((c) =>
          c._id === id ? { ...c, content: updatedContent } : c
        )
      );
      setEditingStates({ ...editingStates, [id]: undefined });
    } catch (err) {
      console.error("Failed to update comment", err);
    }
  };

  if (loading) {
    return (
      <div className="comment-section">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div className="mini-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="comment-section">
      <div className="comment-list">
        {comments.map((comment) => {
          const isAuthor = mongoUser._id === comment.author._id;
          const isEditing = editingStates[comment._id] !== undefined;

          return (
            <div className="comment-item" key={comment._id}>
              <div className="comment-header">
                <span className="comment-author">
                  {comment.author?.username}
                </span>
                {isAuthor && (
                  <div className="comment-icons">
                    {isEditing ? (
                      <button
                        className="comment-icon"
                        onClick={() => handleUpdateComment(comment._id)}
                        title="Save"
                      >
                        💾
                      </button>
                    ) : (
                      <button
                        className="comment-icon"
                        onClick={() =>
                          setEditingStates({
                            ...editingStates,
                            [comment._id]: comment.content,
                          })
                        }
                        title="Edit"
                      >
                        ✎
                      </button>
                    )}
                    <button
                      className="comment-icon"
                      onClick={() => handleDeleteComment(comment._id)}
                      title="Delete"
                    >
                      ✖
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <textarea
                  className="comment-edit-input"
                  value={editingStates[comment._id]}
                  onChange={(e) =>
                    setEditingStates({
                      ...editingStates,
                      [comment._id]: e.target.value,
                    })
                  }
                />
              ) : (
                <div className="comment-content">{comment.content}</div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleAddComment} className="comment-form">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write a comment..."
          className="comment-input"
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !newContent.trim()} className="comment-submit-btn">
          {submitting ? "Adding..." : "Add Comment"}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;