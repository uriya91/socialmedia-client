import React, { useState, useEffect } from "react";
import NewPostForm from "./NewPostForm";
import FeedList from "./FeedList";
import axios from "../utils/axiosConfig";
import { auth } from "../auth/firebaseConfig";
import Spinner from "./Spinner";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hdr = () => ({ headers: { "x-user-id": auth.currentUser?.uid } });

  const fetchMongoUser = async () => {
    try {
      const res = await axios.get("/users/me", hdr());
      setMongoUser(res.data);
    } catch (err) {
      console.error("Failed to fetch Mongo user", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/posts/feed", hdr());
      setPosts(res.data.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  useEffect(() => {
    if (auth.currentUser?.uid) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchMongoUser(), fetchPosts()]);
        setLoading(false);
      };
      loadData();
    }
  }, []);

  const handleNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdated = (postId, newContent) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, content: newContent } : p))
    );
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  if (loading) return <Spinner />;

  if (!mongoUser) return <div>Error loading user data</div>;

  return (
    <div>
      <NewPostForm mongoUser={mongoUser} onPostCreated={handleNewPost} />
      <FeedList
        posts={posts}
        mongoUser={mongoUser}
        setPosts={setPosts}
        onPostUpdated={handlePostUpdated}
        onPostDeleted={handlePostDeleted}
      />
    </div>
  );
};

export default FeedPage;