// script.js

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('reservation-form').addEventListener('submit', function(event) {
      event.preventDefault(); // Evita el envío normal del formulario
  
      // Obtiene los valores de los campos del formulario
      const nombre = document.getElementById('Nombre').value;
      const correo = document.getElementById('Correo').value;
      const fechaReserva = document.getElementById('Fecha').value;
      const horaReserva = document.getElementById('Horario').value;
      const cantidadGente = document.getElementById('Personas').value;
  
      // Envía los datos al back-end
      fetch('http://localhost:3000/reservar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          correo,
          fecha_Reserva: fechaReserva,
          hora_reserva: horaReserva,
          cantidad_Gente: cantidadGente,
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la reserva');
        }
        return response.json();
      })
      .then(data => {
        alert(data.message); // Muestra el mensaje de éxito
        document.getElementById('reservation-form').reset(); // Resetea el formulario
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Hubo un problema al realizar la reserva.');
      });
    });
  });
  