import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Cargando...');

  useEffect(() => {
    // Probando conexión con backend
    fetch(`${import.meta.env.VITE_API_URL}/api/hello`)
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Error al conectar con backend'));

    // Probando conexión con base de datos (opcional)
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then(response => response.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
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