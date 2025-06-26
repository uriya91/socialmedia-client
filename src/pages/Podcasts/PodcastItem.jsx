import React from 'react';
import './PodcastItem.css';

function PodcastItem({ video }) {
  const { title } = video.snippet;
  const videoId = video.id.videoId;

  return (
    <div className="podcast-item">
      <iframe
        className="podcast-video"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <h3 className="podcast-title">{title}</h3>
    </div>
  );
}

export default PodcastItem;
