// crear-direccion.js
const API_URL = "https://devapi.goboxful.com";

const email = "mercaduca0@gmail.com"; 
const password = 'Mercaduca$$2026';

async function inyectarDireccionPrueba() {
  try {
    console.log("⏳ 1. Iniciando sesión en Boxful...");
    const authRes = await fetch(`${API_URL}/auth/client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const authData = await authRes.json();
    
    if (!authRes.ok) throw new Error("Credenciales inválidas");
    const token = authData.accessToken;
    console.log("✅ Sesión iniciada.");

    console.log("⏳ 2. Obteniendo departamentos de Boxful...");
    const statesRes = await fetch(`${API_URL}/states`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const statesData = await statesRes.json();
    
    const estado = statesData.states[0];
    const municipio = estado.Cities[0];
    console.log(`✅ Usando: ${estado.name}, ${municipio.name}`);

    console.log("⏳ 3. Inyectando dirección de prueba...");
    const payload = {
      address: "Calle Falsa 123, Bodega de Pruebas",
      referencePoint: "Frente al ciber de Don Carlos",
      latitude: 13.6929,
      longitude: -89.2182,
      stateId: estado.id,
      cityId: municipio.id,
      addressPhone: "77778888",
      addressAreaCode: "503",
    };

    const createRes = await fetch(`${API_URL}/addresses`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
    });

    const createData = await createRes.json();

    if (createRes.ok) {
      console.log("🎉 ¡ÉXITO! Dirección creada:");
      console.log(`ID de la dirección: ${createData.address.id}`);
      console.log("Ya puedes ir a tu frontend de Mercaduca y darle a 'Validar' 🚀");
    } else {
      console.error("❌ Error al crear:", createData);
    }
  } catch (error) {
    console.error("💥 Ups:", error.message);
  }
}

inyectarDireccionPrueba();