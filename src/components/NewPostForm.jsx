import React, { useState } from "react";
import axios from "../utils/axiosConfig";
import { auth } from "../auth/firebaseConfig";
import "./NewPostForm.css";

const NewPostForm = ({ onPostCreated, mongoUser, groupId = null }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    setLoading(true);

    try {
      const postData = {
        content,
        ...(groupId && { groupId })
      };

      const res = await axios.post(
        "/posts",
        postData,
        { headers: { "x-user-id": auth.currentUser?.uid } }
      );

      const enrichedPost = {
        ...res.data,
        author: mongoUser,
        ...(groupId && { groupId })
      };

      onPostCreated(enrichedPost);
      setContent("");
    } catch (err) {
      console.error("Failed to publish post:", err);
      alert("Failed to publish post");
    } finally {
      setLoading(false);
    }
  };

  const placeholderText = groupId 
    ? "Share your magical thoughts with the group..." 
    : "Share your magical thoughts...";

  return (
    <form className="new-post-form" onSubmit={handleSubmit}>
      <textarea
        className="new-post-textarea"
        placeholder={placeholderText}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />
      <button 
        type="submit" 
        className="sr-btn primary" 
        disabled={loading || !content.trim()}
      >
        {loading ? "Publishing..." : "Publish Post"}
      </button>
    </form>
  );
};

export default NewPostForm;