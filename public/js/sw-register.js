if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js') // Servido desde public/sw.js
        .then(registration => {
          console.log("Service Worker registrado con éxito:", registration);
        })
        .catch(error => {
          console.log("Error en el registro del Service Worker:", error);
        });
    });
  }
  