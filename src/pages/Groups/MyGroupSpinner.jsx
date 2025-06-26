import { useRef } from 'react';
import MyGroupSpinnerItem from './MyGroupSpinnerItem';
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import './MyGroupSpinner.css';

export default function MyGroupSpinner({ groups, onLeave, onCreate, onEdit, onGroupSelect, currentUserId }) {
  const trackRef = useRef(null);
  const scrollAmount = 280;

  const scrollLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mg-spinner-container">
      <button className="mg-nav-arrow mg-nav-left" onClick={scrollLeft}>
        <FaChevronLeft />
      </button>

      <div className="mg-cards-viewport">
        <div className="mg-cards-track" ref={trackRef}>
          <div className="mg-card-item">
            <div className="mg-create-card" onClick={onCreate}>
              <div className="mg-create-content">
                <FaPlus className="mg-create-icon" />
                <span className="mg-create-text">Create New Group</span>
              </div>
            </div>
          </div>

          {groups && groups.map(group => (
            <div key={group._id} className="mg-card-item">
              <MyGroupSpinnerItem
                group={group}
                onLeave={() => onLeave(group._id)}
                onEdit={() => onEdit(group)}
                onGroupSelect={onGroupSelect}
                currentUserId={currentUserId}
              />
            </div>
          ))}
        </div>
      </div>

      <button className="mg-nav-arrow mg-nav-right" onClick={scrollRight}>
        <FaChevronRight />
      </button>
    </div>
  );
}