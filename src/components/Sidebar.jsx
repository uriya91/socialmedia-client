import { useState } from "react";
import "./Sidebar.css";
import EditProfile from "./EditProfile";
import {
  FaUserEdit,
  FaHome,
  FaUsers,
  FaLayerGroup,
  FaMagic,
  FaPodcast,
  FaChartLine,
} from "react-icons/fa";

function Sidebar({ user, onNavigate, onUserUpdate }) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  const username = user?.username || "Wizard User";
  const avatarUrl = (user?.profileImage && user.profileImage.trim()) 
    ? user.profileImage.trim() 
    : "/default-avatar.png";

  const handleEditClick = () => {
    setIsEditProfileOpen(true);
  };

  const handleProfileClose = () => {
    setIsEditProfileOpen(false);
  };

  const handleUserSave = (updatedUser) => {
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
    setIsEditProfileOpen(false);
  };

  return (
    <>
      <div className="sidebar-box">
        <div className="profile-section">
          <img src={avatarUrl} alt="User Avatar" className="avatar" />
          <div className="username-row">
            <span className="username">{username}</span>
            <button className="edit-btn" onClick={handleEditClick}>
              <FaUserEdit />
            </button>
          </div>
        </div>

        <div className="nav-links">
          <button className="sidebar-btn" onClick={() => onNavigate("feed")}>
            <FaHome /> Feed
          </button>
          <button className="sidebar-btn" onClick={() => onNavigate("friends")}>
            <FaUsers /> Friends
          </button>
          <button className="sidebar-btn" onClick={() => onNavigate("groups")}>
            <FaLayerGroup /> Groups
          </button>
          <button
            className="sidebar-btn"
            onClick={() => onNavigate("characters")}
          >
            <FaMagic /> Characters
          </button>
          <button className="sidebar-btn" onClick={() => onNavigate("podcasts")}>
            <FaPodcast /> Podcasts
          </button>
          <button className="sidebar-btn" onClick={() => onNavigate("traffic")}>
            <FaChartLine /> Traffic
          </button>
        </div>
      </div>

      <EditProfile
        user={user}
        isOpen={isEditProfileOpen}
        onClose={handleProfileClose}
        onSave={handleUserSave}
      />
    </>
  );
}

export default Sidebar;