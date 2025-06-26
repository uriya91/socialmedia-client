'use client';

import React, { useEffect, useState } from 'react';
import PodcastItem from './PodcastItem';
import './PodcastGrid.css';
import Spinner from '../../components/Spinner';

function PodcastGrid() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 12;

  const API_KEY = 'AIzaSyAzqPdPdYKqBafV1cgKrOLHURxDPxVYVtg';
  const CHANNEL_ID = 'UCyH3d97vybRKuirpKHPBrIA';

  useEffect(() => {
    const fetchAllVideos = async () => {
      setIsLoading(true);
      try {
        let allVideos = [];
        let nextPageToken = '';
        do {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=50&pageToken=${nextPageToken}`
          );
          const data = await response.json();
          const items = data.items.map((video, idx) => {
            const videoId = video.id.videoId || video.etag || `${video.snippet.title}-${idx}`;
            return { ...video, uniqueId: videoId };
          });
          allVideos = [...allVideos, ...items];
          nextPageToken = data.nextPageToken || '';
        } while (nextPageToken);

        setVideos(allVideos);
      } catch (error) {
        console.error("Error in fetching videos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllVideos();
  }, []);

  const indexOfLast = currentPage * videosPerPage;
  const indexOfFirst = indexOfLast - videosPerPage;
  const currentVideos = videos.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(videos.length / videosPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="podcast-wrapper">
      <div className="podcast-grid">
        {isLoading ? (
          <Spinner />
        ) : (
          currentVideos.map((video) => (
            <PodcastItem key={video.uniqueId} video={video} />
          ))
        )}
      </div>

      {!isLoading && (
        <>
          <div className="pagination-controls">
            <button onClick={handlePrevious} disabled={currentPage === 1}>
              ← Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={handleNext} disabled={currentPage === totalPages}>
              Next →
            </button>
          </div>

          <div className="pagination-numbers">
            {pageNumbers.map(num => (
              <button
                key={num}
                onClick={() => handlePageClick(num)}
                className={num === currentPage ? 'active' : ''}
              >
                {num}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default PodcastGrid;
