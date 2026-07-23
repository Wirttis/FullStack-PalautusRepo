import { useState, useEffect } from 'react'
import axios from 'axios'
import personService from './services/personService'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState("")
  const [message, setMessage] = useState('')
  const [messageState, setMessageState] = useState(0)


  useEffect(() => {
    personService
      .getAll()
      .then(response => {
        setPersons(response)
      })
  }, [])

  const addName = (event) => {
    event.preventDefault()

    const nameObject = {
      name: newName.trim(),
      number: newNumber.trim() }

    const names = persons.map(person => person.name)

    const existingPerson = persons.find(person => person.name === newName.trim())

    if (!newName.trim()) {
      showNotification('New entry must have a name', true)
        return
    }

    if (!newNumber.trim()) {
      showNotification('New entry must have a number', true)
      return
    }

    if (existingPerson) {
      if (existingPerson.number !== newNumber.trim()) {
        if (
          existingPerson.number === '' ||
          window.confirm(
            `${newName} is already added to phonebook, replace old number with a new one?`
          )
        ) {
          updatePerson(existingPerson, nameObject)
        }
      } else {
        showNotification(`${newName} is already added to phonebook`, true)
      }

      return
    }

    personService
      .create(nameObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        showNotification(`Added ${returnedPerson.name}`)
      })
    
    setNewName('')
    setNewNumber("")
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const deleteName = (id, name) => {
    console.log(id)
    if(window.confirm(`Delete ${name}?`)) {
      personService
        .deletNmb(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setMessageState(0)
          setMessage(`Removed ${name}`)
          setTimeout(() => {setMessage(null)}, 5000)
        })
    }
  }

  const updatePerson = (person, updatedPerson) => {
    personService
      .update(person.id, updatedPerson)
      .then(returnedPerson => {
        setPersons(persons.map(p =>p.id !== person.id ? p : returnedPerson))
        showNotification(`Updated ${returnedPerson.name}`)
      })
      .catch(() => {
        showNotification(`Information of '${person.name}' has already been removed from server`,true)
        setPersons(persons.filter(p => p.id !== person.id))
      })
  }

  
  const showNotification = (text, isError = false) => {
    setMessage(text);
    setMessageState(isError ? 1 : 0)

    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={message} state={messageState} />

      <Filter filter={filter} handleFilterChange={handleFilterChange}/>

      <h2>add a new</h2>

      <PersonForm addName={addName} 
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange} 
        handleNumberChange={handleNumberChange} />

      <h2>Numbers</h2>

      <Persons persons = {persons} filter={filter} deleteName={deleteName}/>
    </div>
  )

}

const Filter = ({filter, handleFilterChange}) => {
  return(
    <div>
          filter shown with: <input 
            value={filter}
            onChange={handleFilterChange}
          />
    </div>
  )
}

const PersonForm = ({addName,newName,handleNameChange,newNumber,handleNumberChange}) => {

  return (
    <form onSubmit={addName}>

        <div>
          name: <input 
            value={newName}
            onChange={handleNameChange}
          />
        </div>
        <div>
          number: <input 
            value={newNumber}
            onChange={handleNumberChange}
          />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
  )
}



const Persons = ({persons, filter, deleteName}) => {

  const namesToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return(
    <div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {namesToShow.map(person => (
          <li key={person.id}>
            {person.name} {person.number} <button onClick={() => deleteName(person.id, person.name)}>delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App