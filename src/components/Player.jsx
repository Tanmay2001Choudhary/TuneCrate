import React, { useRef, useState } from 'react'
import {
  BsHeart,
  BsHeartFill,
  BsPauseFill,
  BsPlayFill,
  BsRepeat,
  BsRepeat1,
  BsSkipBackwardFill,
  BsSkipForwardFill,
  BsVolumeDownFill,
  BsVolumeMuteFill,
  BsVolumeUpFill,
} from 'react-icons/bs'
import { LuShuffle } from 'react-icons/lu'
import { useAudio } from '../context/AudioContext'
import '../scss/Player.scss'

const Player = ({ toggleFavorite, favorites }) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    audioRef,
    togglePlay,
    playNextSong,
    playPreviousSong,
    seekTo,
    shuffle,
    setShuffle,
    repeatMode,
    setRepeatMode,
    shuffleHistory,
  } = useAudio()

  const [volume, setVolume] = useState(0.7)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [volumeHoverTimeout, setVolumeHoverTimeout] = useState(null)
  const previousVolume = useRef(volume)
  const volumeSliderRef = useRef(null)
  const [showRemaining, setShowRemaining] = useState(false)

  const isFavorite = currentSong
    ? favorites.some((fav) => fav.id === currentSong.id)
    : false

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume, audioRef])

  React.useEffect(() => {
    const handleKeyPress = (e) => {
      const tagName = document.activeElement.tagName.toLowerCase()
      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        document.activeElement.isContentEditable
      ) {
        console.log('Input field is focused, ignoring key press.')
        return
      }
      const isCtrl = e.ctrlKey || e.metaKey
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        if (isCtrl) playNextSong()
        else seekTo(Math.min(currentTime + 5, duration))
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        if (isCtrl) playPreviousSong()
        else seekTo(Math.max(currentTime - 5, 0))
      } else if (e.code === 'ArrowUp') {
        e.preventDefault()
        changeVolume(Math.min(1, volume + 0.1))
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        changeVolume(Math.max(0, volume - 0.1))
      } else if (e.code === 'KeyM') {
        toggleMute()
      } else if (e.code === 'KeyF') {
        handleFavoriteToggle()
      } else if (e.code === 'KeyS') {
        setShuffle((prev) => !prev)
      } else if (e.code === 'KeyR') {
        cycleRepeatMode()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [
    isPlaying,
    volume,
    currentSong,
    togglePlay,
    playNextSong,
    playPreviousSong,
  ])

  const dragHandler = (e) => {
    const newTime = parseFloat(e.target.value)
    seekTo(newTime)
  }

  const getVolumeIcon = () => {
    if (volume === 0) return <BsVolumeMuteFill />
    if (volume < 0.5) return <BsVolumeDownFill />
    return <BsVolumeUpFill />
  }

  const toggleMute = () => {
    if (volume > 0) {
      previousVolume.current = volume
      changeVolume(0)
    } else {
      changeVolume(previousVolume.current)
    }
  }

  const changeVolume = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolume(clampedVolume)
  }

  const handleVolumeMouseEnter = () => {
    // Clear any existing timeout
    if (volumeHoverTimeout) {
      clearTimeout(volumeHoverTimeout)
      setVolumeHoverTimeout(null)
    }
    setShowVolumeSlider(true)
  }

  const handleVolumeMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowVolumeSlider(false)
    }, 1000) // 1 second delay before hiding
    setVolumeHoverTimeout(timeout)
  }

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  const handleFavoriteToggle = () => {
    if (currentSong) {
      toggleFavorite(currentSong)
    }
  }

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00'
    const sign = time < 0 ? '-' : ''
    const absoluteTime = Math.abs(time)
    const minutes = Math.floor(absoluteTime / 60)
    const seconds = Math.floor(absoluteTime % 60)
      .toString()
      .padStart(2, '0')
    return `${sign}${minutes}:${seconds}`
  }

  const cycleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'repeat-all'
      if (prev === 'repeat-all') return 'repeat-one'
      return 'off'
    })
  }

  return (
    <div className='player'>
      <div className='progress-bar-container'>
        <div className='progress-track'>
          <div
            className='progress-fill'
            style={{ width: `${progressPercentage}%` }}
          />
          <input
            type='range'
            min='0'
            max={duration || 0}
            value={currentTime}
            onChange={dragHandler}
            className='progress-slider'
          />
        </div>
        <div className='time-display'>
          <span
            onClick={() => setShowRemaining(!showRemaining)}
            style={{ cursor: 'pointer' }}
          >
            {showRemaining
              ? `-${formatTime(duration - currentTime)}`
              : formatTime(currentTime)}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className='player-controls'>
        <div className='player-song-controls'>
          <div className='shuffle-control'>
            <button
              className={`shuffle-button ${shuffle ? 'is-shuffled' : ''}`}
              onClick={() => setShuffle(!shuffle)}
              title='Toggle Shuffle'
              aria-label='Toggle Shuffle'
              disabled={!currentSong}
            >
              <LuShuffle className='shuffle-icon' />
            </button>
          </div>

          <div className='favorite-control'>
            <button
              className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
              onClick={handleFavoriteToggle}
              aria-label={
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              disabled={!currentSong}
            >
              {isFavorite ? (
                <BsHeartFill className='favorite-icon filled' />
              ) : (
                <BsHeart className='favorite-icon' />
              )}
            </button>
          </div>
        </div>

        <div className='player-main-controls'>
          <BsSkipBackwardFill
            className='control-icon'
            onClick={playPreviousSong}
          />
          <div className='play-button' onClick={togglePlay}>
            {isPlaying ? (
              <BsPauseFill className='play-icon' />
            ) : (
              <BsPlayFill className='play-icon' />
            )}
          </div>
          <BsSkipForwardFill className='control-icon' onClick={playNextSong} />
        </div>
        <div className='right-controls'>
          <div
            className='volume-control'
            onMouseEnter={handleVolumeMouseEnter}
            onMouseLeave={handleVolumeMouseLeave}
          >
            <div className='control-wrapper' onClick={toggleMute}>
              <span className='control-icon volume-icon'>
                {getVolumeIcon()}
              </span>
            </div>

            {showVolumeSlider && (
              <div className='volume-slider-container'>
                <div className='volume-track'>
                  <div
                    className='volume-fill'
                    style={{ width: `${volume * 100}%` }}
                  />
                  <input
                    ref={volumeSliderRef}
                    type='range'
                    min='0'
                    max='1'
                    step='0.01'
                    value={volume}
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    className='volume-slider'
                  />
                </div>
              </div>
            )}
          </div>
          <div className='repeat-control'>
            <button
              className={`repeat-button ${repeatMode}`}
              onClick={cycleRepeatMode}
              title='Toggle Repeat'
              aria-label='Toggle Repeat'
            >
              {repeatMode === 'repeat-one' ? (
                <span className='repeat-icon'>
                  <BsRepeat1 />
                </span>
              ) : (
                <span className='repeat-icon '>
                  <BsRepeat />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Player
