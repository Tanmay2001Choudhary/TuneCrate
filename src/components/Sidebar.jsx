import React from 'react';
import { Nav } from 'react-bootstrap';
import { BsX } from 'react-icons/bs';
import { GiMusicSpell } from "react-icons/gi";
import '../scss/Sidebar.scss';

const Sidebar = ({ activeTab, setActiveTab, onClose }) => {
  const handleTabSelect = (tabName) => {
    setActiveTab(tabName);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <GiMusicSpell size={28} />
          <span>TuneCrate</span>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            <BsX size={24} />
          </button>
        )}
      </div>

      <Nav className="flex-column">
        <Nav.Link
          className={activeTab === 'forYou' ? 'active' : ''}
          onClick={() => handleTabSelect('forYou')}
        >
          For You
        </Nav.Link>
        <Nav.Link
          className={activeTab === 'topTracks' ? 'active' : ''}
          onClick={() => handleTabSelect('topTracks')}
        >
          Top Tracks
        </Nav.Link>
        <Nav.Link
          className={activeTab === 'favorites' ? 'active' : ''}
          onClick={() => handleTabSelect('favorites')}
        >
          Favourites
        </Nav.Link>
        <Nav.Link
          className={activeTab === 'recentlyPlayed' ? 'active' : ''}
          onClick={() => handleTabSelect('recentlyPlayed')}
        >
          Recently Played
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;