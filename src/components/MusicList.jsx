import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { useAudio } from '../context/AudioContext'
import '../scss/MusicList.scss'

const MusicList = ({ songs, loading, onSongClick }) => {
  const { currentSong, playSong } = useAudio()

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' + secs : secs}`
  }

  return (
    <div className='music-list'>
      {loading ? (
        <div className='shimmer-music-list'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div className='shimmer-song-item' key={index}>
              <div className='shimmer-thumbnail shimmer'></div>
              <div className='shimmer-info'>
                <div className='shimmer-title shimmer'></div>
                <div className='shimmer-artist shimmer'></div>
              </div>
              <div className='shimmer-duration shimmer'></div>
            </div>
          ))}
        </div>
      ) : songs.length === 0 ? (
        <p className='no-songs'>No songs found</p>
      ) : (
        <ListGroup>
          {songs.map((song) => (
            <ListGroup.Item
              key={song.id}
              className={`song-item ${
                currentSong && currentSong.id === song.id ? 'active' : ''
              }`}
              onClick={() => onSongClick(song)}
            >
              <div className='song-thumbnail'>
                <img src={song.thumbnail} alt={song.title} />
              </div>
              <div className='song-info'>
                <h5>{song.title}</h5>
                <p>{song.artistName}</p>
              </div>
              <div className='song-duration'>
                {formatDuration(song.duration)}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  )
}

export default MusicList
