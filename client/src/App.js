import React, { useState, useEffect } from 'react'
import Note from './components/Note'
import Notification from './components/Notification'
import noteService from './services/notes'
import loginServer from './services/login'

const App = () => {
  const [notes, setNotes] = useState([]) 
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  useEffect(() => {
    const userJson = localStorage.getItem('noteapp.user')
    if (userJson) {
      const user = JSON.parse(userJson)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  const addNote = (event) => {
    event.preventDefault()
    const noteObject = {
      content: newNote,
      date: new Date().toISOString(),
      important: Math.random() > 0.5,
      id: notes.length + 1,
    }
  
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
        setNewNote('')
      })
  }

  const toggleImportanceOf = (id) => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }
  
    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id !== id ? note : returnedNote))
      })
      .catch(error => {
        setErrorMessage(
          `Note '${note.content}' was already removed from server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)   
      })
  }

  const handleNoteChange = (event) => {
    setNewNote(event.target.value)
  }

  const notesToShow = showAll
    ? notes
    : notes.filter(note => note.important)

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginServer.login({ username, password })
      
      localStorage.setItem('noteapp.user', JSON.stringify(user))
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (error) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>Username</div>
      <div>
        <input type="text" name="username" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div>Password</div>
      <div>
        <input type="text" name="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const noteForm = () => (
    <form onSubmit={addNote}>
      <input
        value={newNote}
        onChange={handleNoteChange}
      />
      <button type="submit">save</button>
    </form>  
  )

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      
      {
        user === null
        ? loginForm()
        : <div>
            <p>{user.name} logged in</p>
            noteForm()
          </div>
      }
      
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all' }
        </button>
      </div>      
      <ul>
        {notesToShow.map((note, i) => 
          <Note
            key={i}
            note={note} 
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        )}
      </ul>
    </div>
  )
}

export default App 