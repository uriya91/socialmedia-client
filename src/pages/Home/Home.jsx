// src/pages/Home/Home.jsx
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../auth/firebaseConfig";
import axios from "../../utils/axiosConfig";

import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import PageContainer from "../../components/PageContainer";
import Spinner from "../../components/Spinner";
import Login from "../Auth/Login";
import TrafficPage from "../Traffic/TrafficPage";

import FeedPage from "../../components/FeedPage";
import Friends from "../Friends/Friends";
import Groups from "../Groups/Groups";
import Characters from "../Characters/Characters";
import Podcasts from "../Podcasts/Podcasts";
import UserProfile from "../UserProfile/UserProfile";
import GroupDetails from "../GroupDetails/GroupDetails";

import "./Home.css";

export default function Home() {
  /* auth state */
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* local navigation */
  const [activePage, setActivePage] = useState("feed");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  /* firebase listener */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setActivePage("feed");
      setSelectedUser(null);
      setSelectedGroup(null);

      if (fbUser) {
        try {
          const { data } = await axios.get("/users/me", {
            headers: { "x-user-id": fbUser.uid },
          });
          setMongoUser(data);
        } catch {
          setMongoUser(null);
        }
      } else {
        setMongoUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* helpers */
  const handleUserSelect = (id) => {
    setSelectedUser(id);
    setActivePage("userProfile");
  };

  const handleGroupSelect = (id) => {
    setSelectedGroup(id);
    setActivePage("groupDetails");
  };

  const handleSearchSelect = (item) => {
    if (item.__type === "user") {
      handleUserSelect(item._id);
    } else if (item.__type === "group") {
      handleGroupSelect(item._id);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    // וידוא שהתמונה תקינה לפני עדכון
    const cleanUser = {
      ...updatedUser,
      profileImage: updatedUser.profileImage && updatedUser.profileImage.trim() 
        ? updatedUser.profileImage.trim() 
        : ''
    };
    setMongoUser(cleanUser);
  };

  const renderPage = () => {
    switch (activePage) {
      case "feed":
        return <FeedPage />;
      case "friends":
        return <Friends onSelectFriend={handleUserSelect} />;
      case "groups":
        return <Groups currentUserId={mongoUser?._id} onGroupSelect={handleGroupSelect} />;
      case "characters":
        return <Characters />;
      case "podcasts":
        return <Podcasts />;
      case "userProfile":
        return <UserProfile userId={selectedUser} />;
      case "groupDetails":
        return <GroupDetails groupId={selectedGroup} currentUserId={mongoUser?._id} />;
      case "traffic":
        return <TrafficPage />;
      default:
        return <FeedPage />;
    }
  };

  return loading ? (
    <Spinner />
  ) : !mongoUser ? (
    <Login />
  ) : (
    <div className="home-page">
      <Topbar
        currentUserId={mongoUser._id}
        onSearchSelect={handleSearchSelect}
      />

      <div className="home-body">
        <Sidebar 
          user={mongoUser} 
          onNavigate={setActivePage}
          onUserUpdate={handleUserUpdate}
        />
        <PageContainer>{renderPage()}</PageContainer>
      </div>
    </div>
  );
}