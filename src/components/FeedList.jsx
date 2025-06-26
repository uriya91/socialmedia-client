import React, { useState } from "react";
import FeedPostItem from "./FeedPostItem";
import { FaSearch, FaUserAlt, FaHeart, FaFeatherAlt } from "react-icons/fa";
import "./FeedList.css";

const FeedList = ({ posts, mongoUser, setPosts, onPostUpdated, onPostDeleted, isGroupAdmin = false }) => {
  const [searchText, setSearchText] = useState("");
  const [minLikes, setMinLikes] = useState("");
  const [authorName, setAuthorName] = useState("");

  const handlePostDeleted = (postId) => {
    if (setPosts) {
      setPosts(posts.filter((p) => p._id !== postId));
    }
    if (onPostDeleted) {
      onPostDeleted(postId);
    }
  };

  const handlePostUpdated = (postId, newContent) => {
    if (setPosts) {
      setPosts(
        posts.map((p) => (p._id === postId ? { ...p, content: newContent } : p))
      );
    }
    if (onPostUpdated) {
      onPostUpdated(postId, newContent);
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setMinLikes("");
    setAuthorName("");
  };

  const filteredPosts = posts.filter((post) => {
    const contentMatch = post.content
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const likesMatch = (post.likes?.length || 0) >= (minLikes || 0);
    const authorMatch = authorName
      ? post.author?.username?.toLowerCase().includes(authorName.toLowerCase())
      : true;

    return contentMatch && likesMatch && authorMatch;
  });

  return (
    <div className="feed-container">
      <div className="filter-bar">
        <div className="filter-item">
          <FaSearch className="filter-icon" />
          <input
            type="text"
            placeholder="Search by content..."
            className="filter-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <FaHeart className="filter-icon" />
          <input
            type="number"
            placeholder="Min likes"
            className="filter-input"
            value={minLikes}
            onChange={(e) => setMinLikes(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <FaUserAlt className="filter-icon" />
          <input
            type="text"
            placeholder="Author name"
            className="filter-input"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>

        <button className="clear-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {filteredPosts.map((post) => (
        <FeedPostItem
          key={post._id}
          post={post}
          mongoUser={mongoUser}
          onPostDeleted={handlePostDeleted}
          onPostUpdated={handlePostUpdated}
          isGroupAdmin={isGroupAdmin}
        />
      ))}
    </div>
  );
};

export default FeedList;