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
            <p class="mt-1">© ${new Date().getFullYear()} MercadUCA - Universidad Centroamericana</p>
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
© ${new Date().getFullYear()} MercadUCA - Universidad Centroamericana
  `;
};
