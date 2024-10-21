import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/spotify/top-tracks', {
          headers: {
            Authorization: `Bearer your_spotify_access_token`,
          },
        });
        setTracks(response.data.items);
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    };

    fetchTopTracks();
  }, []);

  return (
    <div>
      <h1>Top Spotify Tracks</h1>
      <ul>
        {tracks.map((track) => (
          <li key={track.id}>{track.name} by {track.artists[0].name}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
