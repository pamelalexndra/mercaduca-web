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

export const generateModificationEmailHTML = (datosUsuario, cambios) => {
  const fecha = new Date().toLocaleString("es-SV");

  let cambiosLista = "";

  if (cambios.nombres) {
    cambiosLista += `<div class="flex border-b border-gray-200 pb-2">
      <span class="text-gray-600 font-medium w-32">¡Nuevo! Nombres:</span>
      <span class="text-gray-800 font-bold text-green-600">${datosUsuario.nombres || "No especificado"}</span>
    </div>`;
  } else {
    cambiosLista += `<div class="flex border-b border-gray-200 pb-2">
      <span class="text-gray-600 font-medium w-32">Nombres:</span>
      <span class="text-gray-800">${datosUsuario.nombres || "No especificado"}</span>
    </div>`;
  }

  if (cambios.apellidos) {
    cambiosLista += `<div class="flex border-b border-gray-200 pb-2">
      <span class="text-gray-600 font-medium w-32">¡Nuevo! Apellidos:</span>
      <span class="text-gray-800 font-bold text-green-600">${datosUsuario.apellidos || "No especificado"}</span>
    </div>`;
  } else {
    cambiosLista += `<div class="flex border-b border-gray-200 pb-2">
      <span class="text-gray-600 font-medium w-32">Apellidos:</span>
      <span class="text-gray-800">${datosUsuario.apellidos || "No especificado"}</span>
    </div>`;
  }

  if (cambios.telefono) {
    cambiosLista += `<div class="flex border-b border-gray-200 pb-2">
      <span class="text-gray-600 font-medium w-32">¡Nuevo! Teléfono:</span>
      <span class="text-gray-800 font-bold text-green-600">${datosUsuario.telefono || "No especificado"}</span>
    </div>`;
  } else {
    cambiosLista += `<div class="flex border-b border-gray-200 pb-2">
      <span class="text-gray-600 font-medium w-32">Teléfono:</span>
      <span class="text-gray-800">${datosUsuario.telefono || "No especificado"}</span>
    </div>`;
  }

  if (cambios.correo) {
    cambiosLista += `<div class="flex border-b border-gray-200 pb-2">
      <span class="text-gray-600 font-medium w-32">¡Nuevo! Correo:</span>
      <span class="text-gray-800 font-bold text-green-600">${datosUsuario.correo || "No especificado"}</span>
    </div>`;
  } else {
    cambiosLista += `<div class="flex border-b border-gray-200 pb-2">
      <span class="text-gray-600 font-medium w-32">Correo:</span>
      <span class="text-gray-800">${datosUsuario.correo || "No especificado"}</span>
    </div>`;
  }

  if (cambios.usuario) {
    cambiosLista += `<div class="flex border-b border-gray-200 pb-2">
      <span class="text-gray-600 font-medium w-32">¡Nuevo! Usuario:</span>
      <span class="text-gray-800 font-bold text-green-600">${datosUsuario.usuario || "No especificado"}</span>
    </div>`;
  } else {
    cambiosLista += `<div class="flex border-b border-gray-200 pb-2">
      <span class="text-gray-600 font-medium w-32">Usuario:</span>
      <span class="text-gray-800">${datosUsuario.usuario || "No especificado"}</span>
    </div>`;
  }

  if (datosUsuario.contraseña) {
    cambiosLista += `<div class="flex border-b border-gray-200 pb-2">
      <span class="text-gray-600 font-medium w-32">¡Nuevo! Contraseña:</span>
      <span class="text-gray-800 font-bold text-green-600">${datosUsuario.contraseña}</span>
    </div>`;
  }

  if (datosUsuario.twoFactorChanged || cambios.twoFactor) {
    if (datosUsuario.twoFactorEnabled) {
      cambiosLista += `
        <div class="flex border-b border-gray-200 pb-2">
          <span class="text-gray-600 font-medium w-32"> Verificación en 2 pasos:</span>
          <span class="text-green-600 font-bold">ACTIVADA</span>
        </div>
      `;
    } else {
      cambiosLista += `
        <div class="flex border-b border-gray-200 pb-2">
          <span class="text-gray-600 font-medium w-32"> Verificación en 2 pasos:</span>
          <span class="text-red-600 font-bold">DESACTIVADA</span>
        </div>
      `;
    }
  }

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
        <div class="bg-yellow-600 text-white p-6 rounded-t-lg">
          <h1 class="text-2xl font-bold">MercadUCA</h1>
          <p class="text-yellow-100">Tus datos han sido modificados</p>
        </div>
        
        <div class="p-6">
          <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p class="text-yellow-800 font-semibold">
              Se ha detectado una modificación en tu perfil
            </p>
            <p class="text-yellow-600 mt-1">Fecha: ${fecha}</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Datos actualizados:</h2>
            
            <div class="space-y-2">
              ${cambiosLista}
            </div>
          </div>
          
          ${
            datosUsuario.twoFactorChanged && datosUsuario.twoFactorEnabled
              ? `
          <div class="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <h3 class="font-semibold text-green-800 mb-2"> ¡Verificación en dos pasos activada!</h3>
            <p class="text-green-700">Tu cuenta ahora está protegida con autenticación de dos factores. Cada inicio de sesión requerirá un código adicional de Google Authenticator o Authy.</p>
            <p class="text-green-700 mt-2"><strong> Importante:</strong> Si no fuiste tú quien activó esta función, contacta inmediatamente a soporte.</p>
          </div>
          `
              : ""
          }
          
          ${
            datosUsuario.twoFactorChanged && !datosUsuario.twoFactorEnabled
              ? `
          <div class="mt-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <h3 class="font-semibold text-red-800 mb-2"> Verificación en dos pasos desactivada</h3>
            <p class="text-red-700">La autenticación de dos factores ha sido <strong>desactivada</strong> en tu cuenta.</p>
            <p class="text-red-700 mt-2">Tu cuenta ahora tiene menor seguridad. Te recomendamos activar nuevamente 2FA desde la configuración de tu perfil.</p>
            <p class="text-red-700 mt-2"><strong> ¿No solicitaste este cambio?</strong> Contacta inmediatamente a soporte.</p>
          </div>
          `
              : ""
          }
          
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="font-semibold text-blue-800 mb-2">¿No reconoces estos cambios?</h3>
            <p class="text-blue-700">Si no realizaste estas modificaciones, por favor contacta inmediatamente al equipo de MercadUCA.</p>
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

export const generateModificationEmailText = (datosUsuario, cambios) => {
  let texto = `
  Tus datos han sido modificados en MercadUCA
  
  Fecha: ${new Date().toLocaleString("es-SV")}
  
  Datos actualizados:
  ---------------------------`;

  if (cambios.nombres) {
    texto += `\n¡Nuevo! Nombres: ${datosUsuario.nombres || "No especificado"}`;
  } else {
    texto += `\nNombres: ${datosUsuario.nombres || "No especificado"}`;
  }

  if (cambios.apellidos) {
    texto += `\n¡Nuevo! Apellidos: ${datosUsuario.apellidos || "No especificado"}`;
  } else {
    texto += `\nApellidos: ${datosUsuario.apellidos || "No especificado"}`;
  }

  if (cambios.telefono) {
    texto += `\n¡Nuevo! Teléfono: ${datosUsuario.telefono || "No especificado"}`;
  } else {
    texto += `\nTeléfono: ${datosUsuario.telefono || "No especificado"}`;
  }

  if (cambios.correo) {
    texto += `\n¡Nuevo! Correo: ${datosUsuario.correo || "No especificado"}`;
  } else {
    texto += `\nCorreo: ${datosUsuario.correo || "No especificado"}`;
  }

  if (cambios.usuario) {
    texto += `\n¡Nuevo! Usuario: ${datosUsuario.usuario || "No especificado"}`;
  } else {
    texto += `\nUsuario: ${datosUsuario.usuario || "No especificado"}`;
  }

  if (datosUsuario.contraseña) {
    texto += `\n¡Nuevo! Contraseña: ${datosUsuario.contraseña}`;
  }

  if (datosUsuario.twoFactorChanged || cambios.twoFactor) {
    if (datosUsuario.twoFactorEnabled) {
      texto += `\n¡Nuevo! Verificación en 2 pasos: ACTIVADA`;
    } else {
      texto += `\n¡Nuevo! Verificación en 2 pasos: DESACTIVADA`;
    }
  }

  texto += `
  
  ---------------------------
  `;

  if (datosUsuario.twoFactorChanged && datosUsuario.twoFactorEnabled) {
    texto += `
  ¡Verificación en dos pasos activada!
  Tu cuenta ahora está protegida con autenticación de dos factores.
  Cada inicio de sesión requerirá un código adicional de Google Authenticator.
  
  Importante: Si no fuiste tú quien activó esta función, contacta inmediatamente a soporte.
  
  `;
  }

  if (datosUsuario.twoFactorChanged && !datosUsuario.twoFactorEnabled) {
    texto += `
  Verificación en dos pasos desactivada
  La autenticación de dos factores ha sido DESACTIVADA en tu cuenta.
  Tu cuenta ahora tiene menor seguridad. Te recomendamos activarla nuevamente.
  
  ¿No solicitaste este cambio? Contacta inmediatamente a soporte.
  
  `;
  }

  texto += `
  ¿No reconoces estos cambios?
  Si no realizaste estas modificaciones, por favor contacta inmediatamente al equipo de MercadUCA.
  
  Este es un mensaje automático, por favor no responder.
  © ${new Date().getFullYear()} MercadUCA - Universidad Centroamericana José Simeon Cañas
  `;

  return texto;
};

export const generateLoginEmailHTML = (loginData) => {
  const fecha = new Date(loginData.timestamp).toLocaleString("es-SV", {
    dateStyle: "full",
    timeStyle: "medium",
  });

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
          <p class="text-blue-100">Notificacion de inicio de sesion</p>
        </div>
        
        <div class="p-6">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p class="text-blue-800 font-semibold">
              Se ha detectado un nuevo inicio de sesion en tu cuenta
            </p>
            <p class="text-blue-600 mt-1">Fecha: ${fecha}</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Detalles del inicio de sesion:</h2>
            
            <div class="space-y-2">
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Ubicacion:</span>
                <span class="text-gray-800">${loginData.location}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Dispositivo:</span>
                <span class="text-gray-800">${loginData.device}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Navegador:</span>
                <span class="text-gray-800">${loginData.browser}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Sistema Operativo:</span>
                <span class="text-gray-800">${loginData.os}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Movil:</span>
                <span class="text-gray-800">${loginData.isMobile ? "Si" : "No"}</span>
              </div>
              
              <div class="flex">
                <span class="text-gray-600 font-medium w-32">Direccion IP:</span>
                <span class="text-gray-800">${loginData.ip}</span>
              </div>
            </div>
          </div>
          
          ${
            loginData.isNewDevice
              ? `
          <div class="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <p class="text-yellow-800 font-semibold">Dispositivo nuevo detectado</p>
            <p class="text-yellow-700 text-sm">Este es un dispositivo que no habias utilizado antes para acceder a tu cuenta.</p>
          </div>
          `
              : ""
          }
          
          ${
            loginData.isNewLocation
              ? `
          <div class="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <p class="text-yellow-800 font-semibold">Ubicacion nueva detectada</p>
            <p class="text-yellow-700 text-sm">Este inicio de sesion proviene de una ubicacion diferente a la habitual.</p>
          </div>
          `
              : ""
          }
          
          <div class="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 class="font-semibold text-green-800 mb-2">Reconoces esta actividad?</h3>
            <p class="text-green-700">Si fuiste tu, no necesitas hacer nada.</p>
          </div>
          
          <div class="mt-4 p-4 bg-red-50 rounded-lg">
            <h3 class="font-semibold text-red-800 mb-2">No reconoces esta actividad?</h3>
            <p class="text-red-700">Si no fuiste tu quien inicio sesion, por favor:</p>
            <ul class="text-red-700 text-sm mt-2 list-disc list-inside">
              <li>Cambia tu contrasena inmediatamente</li>
              <li>Contacta al soporte de MercadUCA</li>
              <li>Revisa tu configuracion de seguridad</li>
            </ul>
          </div>
          
          <div class="mt-8 text-center text-gray-500 text-sm">
            <p>Este es un mensaje automatico, por favor no responder.</p>
            <p class="mt-1">© ${new Date().getFullYear()} MercadUCA - Universidad Centroamericana Jose Simeon Canas</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateLoginEmailText = (loginData) => {
  const fecha = new Date(loginData.timestamp).toLocaleString("es-SV", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  let texto = `
  MERCADUCA - NOTIFICACION DE INICIO DE SESION

  Hola ${loginData.nombre},

  Se ha detectado un nuevo inicio de sesion en tu cuenta.

  Detalles del inicio de sesion:
  -------------------------------
  Fecha y hora: ${fecha}
  Ubicacion: ${loginData.location}
  Dispositivo: ${loginData.device}
  Navegador: ${loginData.browser}
  Sistema Operativo: ${loginData.os}
  Movil: ${loginData.isMobile ? "Si" : "No"}
  Direccion IP: ${loginData.ip}

  `;

  if (loginData.isNewDevice) {
    texto += `\nEste es un dispositivo nuevo que no habias utilizado antes.\n`;
  }

  if (loginData.isNewLocation) {
    texto += `\nEsta es una ubicacion nueva desde la que no habias iniciado sesion.\n`;
  }

  texto += `
  -------------------------------

  Reconoces esta actividad? Si fuiste tu, no necesitas hacer nada.

  No reconoces esta actividad? Si no fuiste tu, por favor:
  1. Cambia tu contrasena inmediatamente
  2. Contacta al soporte de MercadUCA
  3. Revisa tu configuracion de seguridad

  --
  MercadUCA - Apoyando a emprendedores salvadorenos
  Este es un correo automatico de seguridad.
  `;

  return texto;
};