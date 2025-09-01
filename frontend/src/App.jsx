import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Cargando...');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/hello`)
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Error al conectar con backend'));
  }, []);

  return (
    <div>
      <h1>{message}</h1>
      <h1>Funciona!</h1>
      <p>La aplicacion está funcionando</p>
    </div>
  )

}

export default App;