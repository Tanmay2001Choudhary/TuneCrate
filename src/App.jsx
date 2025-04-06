import ColorThief from 'colorthief'
import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { BsList, BsMusicNoteList, BsX } from 'react-icons/bs'
import { IoMdArrowBack } from 'react-icons/io'
import MusicList from './components/MusicList'
import Player from './components/Player'
import SearchBar from './components/SearchBar'
import Sidebar from './components/Sidebar'
import { useAudio } from './context/AudioContext'
import dummyData from './data/songs.js'
import './scss/App.scss'

const App = () => {
  const { currentSong, playSong, setPlaylist } = useAudio()

  const [songs, setSongs] = useState(dummyData)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeTab, setActiveTab] = useState('forYou')
  const [favorites, setFavorites] = useState([])
  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [filteredSongs, setFilteredSongs] = useState(songs)
  const [playerColor, setPlayerColor] = useState('')
  const [mobileView, setMobileView] = useState('player')
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [topTracks, setTopTracks] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPlaylist(dummyData)
      setSongs(dummyData)
      setFilteredSongs(dummyData)
      setLoading(false)
    }, 1000)

    const storedFavorites = localStorage.getItem('favorites')
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }

    const storedRecentlyPlayed = sessionStorage.getItem('recentlyPlayed')
    if (storedRecentlyPlayed) {
      setRecentlyPlayed(JSON.parse(storedRecentlyPlayed))
    }

    const storedPlayCounts = localStorage.getItem('playCounts')
    if (storedPlayCounts) {
      const playCounts = JSON.parse(storedPlayCounts)
      updateTopTracks(playCounts)
    } else {
      setTopTracks([...dummyData].slice(0, 5))
    }

    handleWindowResize()
    window.addEventListener('resize', handleWindowResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  useEffect(() => {
    if (currentSong) {
      updatePlayerColor(currentSong)
      updateRecentlyPlayed(currentSong)
    }
  }, [currentSong])

  const updateRecentlyPlayed = (song) => {
    if (!song) return

    const updatedRecent = [
      song,
      ...recentlyPlayed.filter((item) => item.id !== song.id),
    ].slice(0, 10)
    setRecentlyPlayed(updatedRecent)
    sessionStorage.setItem('recentlyPlayed', JSON.stringify(updatedRecent))
  }

  const handleWindowResize = () => {
    const mobile = window.innerWidth <= 768
    setIsMobile(mobile)

    if (mobile) {
      setShowSidebar(false)
    } else {
      setShowSidebar(true)
      setMobileView('both')
    }
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

const toggleMobileView = () => {
    setMobileView(mobileView === 'player' ? 'list' : 'player')
  }

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab)

    if (isMobile) {
      setMobileView('list')
      setShowSidebar(false)
    }

    setPlaylist(getCurrentContent(tab))
  }
  const incrementPlayCount = (song) => {
    if (!song) return

    const storedPlayCounts = localStorage.getItem('playCounts')
    let playCounts = storedPlayCounts ? JSON.parse(storedPlayCounts) : {}

    playCounts[song.id] = (playCounts[song.id] || 0) + 1

    localStorage.setItem('playCounts', JSON.stringify(playCounts))

    updateTopTracks(playCounts)
  }

  const updateTopTracks = (playCounts) => {
    const allSongs = dummyData
    const playedSongs = allSongs.filter(song => playCounts[song.id] > 0)

    const sortedSongs = [...playedSongs].sort((a, b) => {
      const countA = playCounts[a.id] || 0
      const countB = playCounts[b.id] || 0
      return countB - countA
    })

    setTopTracks(sortedSongs)
  }

  const handleSearch = (term) => {
    if (!term) {
      setFilteredSongs(songs)
    } else {
      const filtered = songs.filter((song) => {
        if (!song.title || !song.artistName) return false

        const lowerTerm = term.toLowerCase().trim()
        const titleMatch = song.title.toLowerCase().includes(lowerTerm)
        const artistMatch = song.artistName
          .split('|')
          .map((artist) => artist.trim().toLowerCase())
          .some((artist) => artist.includes(lowerTerm))

        return titleMatch || artistMatch
      })

      setFilteredSongs(filtered)

      if (activeTab === 'forYou') {
        setPlaylist(filtered)
      }
    }
  }

  const toggleFavorite = (song) => {
    let updatedFavorites

    if (favorites.some((fav) => fav.id === song.id)) {
      updatedFavorites = favorites.filter((fav) => fav.id !== song.id)
    } else {
      updatedFavorites = [...favorites, song]
    }

    setFavorites(updatedFavorites)
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))

    if (activeTab === 'favorites') {
      setPlaylist(updatedFavorites)
    }
  }

  const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const ensureDarkMode = (r, g, b) => {
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b

    if (brightness > 130) {
      const darkenFactor = 0.5
      return [
        Math.floor(r * darkenFactor),
        Math.floor(g * darkenFactor),
        Math.floor(b * darkenFactor),
      ]
    }

    return [r, g, b]
  }

  const darkenColor = (hex, percent) => {
    let r = parseInt(hex.substring(1, 3), 16)
    let g = parseInt(hex.substring(3, 5), 16)
    let b = parseInt(hex.substring(5, 7), 16)

    r = Math.floor(r * (1 - percent / 100))
    g = Math.floor(g * (1 - percent / 100))
    b = Math.floor(b * (1 - percent / 100))

    r = Math.max(0, r)
    g = Math.max(0, g)
    b = Math.max(0, b)

    return rgbToHex(r, g, b)
  }

  const updatePlayerColor = (song) => {
    const fallbackGradient = 'linear-gradient(135deg, #141e30, #243b55)'

    if (!song.thumbnail) {
      document.documentElement.style.setProperty(
        '--bg-gradient',
        fallbackGradient
      )
      setPlayerColor(fallbackGradient)
      return
    }

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = song.thumbnail

    img.onload = () => {
      try {
        const colorThief = new ColorThief()
        const dominantColor = colorThief.getColor(img)
        const darkModeColor = ensureDarkMode(...dominantColor)
        const mainColor = rgbToHex(...darkModeColor)
        const secondaryColor = darkenColor(mainColor, 40)
        const newGradient = `linear-gradient(135deg, ${mainColor}, ${secondaryColor})`

        document.documentElement.style.setProperty('--bg-gradient', newGradient)
        setPlayerColor(newGradient)
      } catch (error) {
        console.error('Error extracting color from image:', error)
        document.documentElement.style.setProperty(
          '--bg-gradient',
          fallbackGradient
        )
        setPlayerColor(fallbackGradient)
      }
    }

    img.onerror = () => {
      console.error('Error loading image for color extraction')
      document.documentElement.style.setProperty(
        '--bg-gradient',
        fallbackGradient
      )
      setPlayerColor(fallbackGradient)
    }
  }

  const getCurrentContent = (tab = activeTab) => {
    switch (tab) {
      case 'favorites':
        return favorites
      case 'recentlyPlayed':
        return recentlyPlayed
      case 'topTracks':
        return topTracks
      default:
        return filteredSongs
    }
  }

  const handleSongClick = (song) => {
    playSong(song)
    if (isMobile) {
      setMobileView('player')
    }
    incrementPlayCount(song)
  }

  const renderMobileNavBar = () => {
    return (
      <div className='mobile-nav-bar'>
        <Button variant='link' className='menu-button' onClick={toggleSidebar}>
          {showSidebar ? <BsX size={24} /> : <BsList size={24} />}
        </Button>

        <h3 className='mobile-title'>
          {mobileView === 'player'
            ? currentSong?.title
            : activeTab === 'forYou'
            ? 'For You'
            : activeTab === 'favorites'
            ? 'Favourites'
            : activeTab === 'recentlyPlayed'
            ? 'Recently Played'
            : 'Top Tracks'}
        </h3>

        <Button
          variant='link'
          className='view-toggle-button'
          onClick={toggleMobileView}
        >
          {mobileView === 'player' ? (
            <BsMusicNoteList size={24} />
          ) : (
            <IoMdArrowBack size={24} />
          )}
        </Button>
      </div>
    )
  }

  return (
    <Container fluid className='app-container'>
      {isMobile && renderMobileNavBar()}

      <Row className='h-100 g-0'>
        {showSidebar && (
          <Col
            md={3}
            className={`sidebar-container ${isMobile ? 'mobile' : ''}`}
          >
            <Sidebar
              activeTab={activeTab}
              setActiveTab={handleSetActiveTab}
              onClose={isMobile ? toggleSidebar : null}
            />
          </Col>
        )}

        <Col md={showSidebar ? 9 : 12} className='main-content'>
          <Row className='g-0'>
            {/* Music List */}
            {(!isMobile || mobileView === 'list') && (
              <Col xs={12} lg={6} className='music-list-container'>
                <div className='music-list-header'>
                  <h2>
                    {activeTab === 'forYou'
                      ? 'For You'
                      : activeTab === 'favorites'
                      ? 'Favourites'
                      : activeTab === 'recentlyPlayed'
                      ? 'Recently Played'
                      : 'Top Tracks'}
                  </h2>
                  <SearchBar onSearch={handleSearch} />
                </div>

                <MusicList
                  songs={getCurrentContent()}
                  loading={loading}
                  onSongClick={handleSongClick}
                />
              </Col>
            )}

            {(!isMobile || mobileView === 'player') && (
              <Col xs={12} lg={6} className='current-song-col'>
                <div
                  className='current-song-details'
                  style={{
                    background: playerColor
                      ? 'var(--bg-gradient)'
                      : 'transparent',
                  }}
                >
                  <div className='current-song-details-content'>
                    {loading ? (
                      <>
                        {!isMobile && (
                          <div className='shimmer shimmer-title'></div>
                        )}
                        <div className='shimmer shimmer-artist'></div>
                      </>
                    ) : (
                      <>
                        {!isMobile && <h3>{currentSong?.title}</h3>}
                        <p>{currentSong?.artistName}</p>
                      </>
                    )}
                  </div>
                  <div className='album-cover'>
                    {loading ? (
                      <div className='shimmer'></div>
                    ) : (
                      <img
                        src={currentSong?.thumbnail}
                        alt={currentSong?.title}
                      />
                    )}
                  </div>

                  <div className='player-controls'>
                    <Player
                      toggleFavorite={toggleFavorite}
                      favorites={favorites}
                    />
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

export default App
