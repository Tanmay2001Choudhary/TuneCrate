import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

const AudioContext = createContext()

export const AudioProvider = ({ children }) => {
  const [songs, setSongs] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const audioRef = useRef(null)
  const isFirstLoad = useRef(true)
  const [shuffle, setShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState('off')
  const [shuffleHistory, setShuffleHistory] = useState([])

  useEffect(() => {
    if (songs.length > 0 && !currentSong) {
      setCurrentSong(songs[0])
      setIsPlaying(false)
      isFirstLoad.current = false
    }
  }, [songs])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => {
      if (autoplay) {
        playNextSong()
      } else {
        setIsPlaying(false)
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [autoplay, currentSong])

  const playSong = (song) => {
    setCurrentSong(song)

    if (isFirstLoad.current) {
      setIsPlaying(false)
      isFirstLoad.current = false
      return
    }

    setIsPlaying(true)

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((err) => console.error('Playback error:', err))
      }
    }, 50)
  }

  const togglePlay = () => {
    if (!currentSong) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current
        .play()
        .catch((err) => console.error('Playback error:', err))
    }

    setIsPlaying(!isPlaying)
  }

  const playNextSong = () => {
    if (!currentSong || songs.length === 0) return

    if (repeatMode === 'repeat-one') {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setIsPlaying(true)
      return
    }

    if (shuffle) {
      const remainingSongs = songs.filter(
        (song) =>
          song.id !== currentSong.id && !shuffleHistory.includes(song.id)
      )

      if (remainingSongs.length === 0) {
        setShuffleHistory([]) // Reset history when all songs played
        const newShuffle = songs.filter((song) => song.id !== currentSong.id)
        const randomSong =
          newShuffle[Math.floor(Math.random() * newShuffle.length)]
        setShuffleHistory([currentSong.id])
        playSong(randomSong)
      } else {
        const randomSong =
          remainingSongs[Math.floor(Math.random() * remainingSongs.length)]
        setShuffleHistory((prev) => [...prev, currentSong.id])
        playSong(randomSong)
      }
    } else {
      const currentIndex = songs.findIndex((song) => song.id === currentSong.id)
      const nextIndex = (currentIndex + 1) % songs.length

      if (nextIndex === 0 && repeatMode === 'off') {
        setIsPlaying(false)
      } else {
        playSong(songs[nextIndex])
      }
    }
  }

  const playPreviousSong = () => {
    if (!currentSong || songs.length === 0) return

    if (shuffle) {
      if (shuffleHistory.length === 0) return

      const prevSongId = shuffleHistory[shuffleHistory.length - 1]
      setShuffleHistory((prev) => prev.slice(0, -1))
      const prevSong = songs.find((song) => song.id === prevSongId)
      if (prevSong) playSong(prevSong)
    } else {
      const currentIndex = songs.findIndex((song) => song.id === currentSong.id)
      const prevIndex = (currentIndex - 1 + songs.length) % songs.length
      playSong(songs[prevIndex])
    }
  }

  const seekTo = (time) => {
    if (!audioRef.current) return

    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const setPlaylist = (newSongs) => {
    setSongs(newSongs)
  }

  const value = {
    audioRef,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    autoplay,
    songs,
    playSong,
    togglePlay,
    playNextSong,
    playPreviousSong,
    seekTo,
    setPlaylist,
    setAutoplay,
    setCurrentTime,
    shuffle,
    setShuffle,
    repeatMode,
    setRepeatMode,
    shuffleHistory,
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio ref={audioRef} src={currentSong?.musicUrl} />
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
