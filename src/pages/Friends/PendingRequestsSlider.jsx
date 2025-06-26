import { useRef } from 'react';
import PendingRequestCard from './PendingRequestCard';
import './PendingRequestsSlider.css';

export default function PendingRequestsSlider({ requests, onAccept, onDecline }) {
  const ref = useRef(null);

  const scroll = dir => {
    ref.current?.scrollBy({ left: dir * 180, behavior: 'smooth' });
  };

  return (
    <div className="prs-wrapper">
      <button className="prs-arrow left"  onClick={() => scroll(-1)}>‹</button>

      <div className="prs-track" ref={ref}>
        {requests.length === 0
          ? <div className="prs-empty">No pending requests</div>
          : requests.map(r => (
              <PendingRequestCard key={r._id} user={r}
                onAccept={() => onAccept(r._id)}
                onDecline={() => onDecline(r._id)} />
            ))}
      </div>

      <button className="prs-arrow right" onClick={() => scroll(1)}>›</button>
    </div>
  );
}
