export const generateEmailHTML = (solicitud) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
      <div class="max-w-lg mx-auto bg-white rounded-lg shadow-lg mt-8">
        <div class="bg-blue-600 text-white p-6 rounded-t-lg">
          <h1 class="text-2xl font-bold">MercadUCA</h1>
          <p class="text-blue-100">Sistema de Gestión</p>
        </div>
        
        <div class="p-6">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p class="text-blue-800 font-semibold">
              Tienes una nueva solicitud de registro en MercadUCA
            </p>
            <p class="text-blue-600 mt-1">Por favor ve a revisar</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Información de la solicitud:</h2>
            
            <div class="space-y-2">
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">ID:</span>
                <span class="text-gray-800">${solicitud.id_solicitud}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Nombre:</span>
                <span class="text-gray-800">${solicitud.nombres} ${solicitud.apellidos}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Usuario:</span>
                <span class="text-gray-800">${solicitud.usuario}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Correo:</span>
                <span class="text-gray-800">${solicitud.correo}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Fecha:</span>
                <span class="text-gray-800">${new Date().toLocaleString("es-SV")}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-8 text-center text-gray-500 text-sm">
            <p>Este es un mensaje automático, por favor no responder.</p>
            <p class="mt-1">© ${new Date().getFullYear()} MercadUCA - Universidad Centroamericana José Simeon Cañas</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateEmailText = (solicitud) => {
  return `
  Tienes una nueva solicitud de registro en MercadUCA
  Por favor ve a revisar

  Información de la solicitud:
  ----------------------------
  ID: ${solicitud.id_solicitud}
  Nombre: ${solicitud.nombres} ${solicitud.apellidos}
  Usuario: ${solicitud.usuario}
  Correo: ${solicitud.correo}
  Fecha: ${new Date().toLocaleString("es-SV")}

  Este es un mensaje automático, por favor no responder.
  © ${new Date().getFullYear()} MercadUCA - Universidad Centroamericana Universidad Centroamericana José Simeon Cañas
    `;
};

export const generateAcceptanceEmailHTML = (solicitud, razon = "") => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
      <div class="max-w-lg mx-auto bg-white rounded-lg shadow-lg mt-8">
        <div class="bg-green-600 text-white p-6 rounded-t-lg">
          <h1 class="text-2xl font-bold">MercadUCA</h1>
          <p class="text-green-100">Solicitud Aceptada</p>
        </div>
        
        <div class="p-6">
          <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p class="text-green-800 font-semibold">
              ¡Felicidades! Tu solicitud ha sido aceptada
            </p>
            <p class="text-green-600 mt-1">Ya puedes comenzar a vender en MercadUCA</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Detalles de tu cuenta:</h2>
            
            <div class="space-y-2">
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Nombre:</span>
                <span class="text-gray-800">${solicitud.nombres} ${solicitud.apellidos}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Usuario:</span>
                <span class="text-gray-800 font-bold">${solicitud.usuario}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Correo:</span>
                <span class="text-gray-800">${solicitud.correo}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Fecha de aceptación:</span>
                <span class="text-gray-800">${new Date().toLocaleString("es-SV")}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="font-semibold text-blue-800 mb-2">¡Comienza ahora!</h3>
            <p class="text-blue-700">Accede al sistema con tu usuario y contraseña para comenzar a gestionar tus productos.</p>
          </div>
          
          <div class="mt-8 text-center text-gray-500 text-sm">
            <p>Este es un mensaje automático, por favor no responder.</p>
            <p class="mt-1">© ${new Date().getFullYear()} MercadUCA - Universidad Centroamericana José Simeon Cañas</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateRejectionEmailHTML = (solicitud, razon = "") => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
      <div class="max-w-lg mx-auto bg-white rounded-lg shadow-lg mt-8">
        <div class="bg-red-600 text-white p-6 rounded-t-lg">
          <h1 class="text-2xl font-bold">MercadUCA</h1>
          <p class="text-red-100">Solicitud Rechazada</p>
        </div>
        
        <div class="p-6">
          <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p class="text-red-800 font-semibold">
              Lo sentimos, tu solicitud ha sido rechazada
            </p>
            <p class="text-red-600 mt-1">Puedes contactarnos para más información</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Detalles de la solicitud:</h2>
            
            <div class="space-y-2">
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Nombre:</span>
                <span class="text-gray-800">${solicitud.nombres} ${solicitud.apellidos}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Usuario solicitado:</span>
                <span class="text-gray-800">${solicitud.usuario}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Correo:</span>
                <span class="text-gray-800">${solicitud.correo}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Fecha de rechazo:</span>
                <span class="text-gray-800">${new Date().toLocaleString("es-SV")}</span>
              </div>
            </div>
          </div>
          
          ${
            razon
              ? `
          <div class="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 class="font-semibold text-yellow-800 mb-2">Razón del rechazo:</h3>
            <p class="text-yellow-700">${razon}</p>
          </div>
          `
              : ""
          }
          
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">¿Tienes preguntas?</h3>
            <p class="text-gray-700">Puedes contactar al equipo de MercadUCA para más información sobre los requisitos de registro.</p>
          </div>
          
          <div class="mt-8 text-center text-gray-500 text-sm">
            <p>Este es un mensaje automático, por favor no responder.</p>
            <p class="mt-1">© ${new Date().getFullYear()} MercadUCA - Universidad Centroamericana José Simeon Cañas</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateAcceptanceEmailText = (solicitud) => {
  return `
  Estimado/a ${solicitud.nombres} ${solicitud.apellidos},

  ¡Felicidades! Tu solicitud de registro en MercadUCA ha sido aceptada.
  Ya puedes comenzar a vender en nuestra plataforma.

  Detalles de tu cuenta:
  - Nombre: ${solicitud.nombres} ${solicitud.apellidos}
  - Usuario: ${solicitud.usuario}
  - Correo: ${solicitud.correo}
  - Fecha de aceptación: ${new Date().toLocaleString("es-SV")}

  Accede al sistema con tu usuario y contraseña para comenzar a gestionar tus productos.

  Este es un mensaje automático, por favor no responder.
  © ${new Date().getFullYear()} MercadUCA - Universidad Centroamericana José Simeon Cañas
    `;
};

export const generateRejectionEmailText = (solicitud, razon = "") => {
  return `
  Estimado/a ${solicitud.nombres} ${solicitud.apellidos},

  Lo sentimos, tu solicitud de registro en MercadUCA ha sido rechazada.

  Detalles de la solicitud:
  - Nombre: ${solicitud.nombres} ${solicitud.apellidos}
  - Usuario solicitado: ${solicitud.usuario}
  - Correo: ${solicitud.correo}
  - Fecha de rechazo: ${new Date().toLocaleString("es-SV")}

  ${razon ? `Razón del rechazo: ${razon}` : ""}

  Puedes contactar al equipo de MercadUCA para más información sobre los requisitos de registro.

  Este es un mensaje automático, por favor no responder.
  © ${new Date().getFullYear()} MercadUCA - Universidad Centroamericana José Simeon Cañas
    `;
};
