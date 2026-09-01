import { useState } from 'react'
import './App.css'

function App() {
  const [name, setName] = useState('')

  const handleTestSubmit = async () => {
    if (!name) {
      alert("Please enter a name first!");
      return;
    }

    try {
      // This is where React physically sends the data to your Node server!
      const response = await fetch('http://localhost:5000/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name })
      });

      // Wait for the server to reply, then read the message
      const data = await response.json();
      alert(`Success! 🟢 Server says: ${data.message}`);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Uh oh! 🔴 Could not connect to the backend. Is the server running?");
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#333' }}>UniBites Web POC</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>React Web Frontend is Alive! </p>

      <input 
        type="text" 
        placeholder="Enter a test name" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: '10px', width: '250px', marginRight: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
      />

      <button 
        onClick={handleTestSubmit}
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Test Database Connection
      </button>
    </div>
  )
}

export default App