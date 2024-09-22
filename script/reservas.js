document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('elegir-mesa').addEventListener('click', function() {
        const mesasContainer = document.getElementById('mesas-container');
        const mesasDiv = document.getElementById('mesas');
        mesasDiv.innerHTML = ''; // Limpia el contenedor de mesas

        // Muestra las mesas disponibles
        for (let i = 1; i <= 6; i++) {
            const mesa = document.createElement('div');
            mesa.className = 'mesa';
            mesa.innerText = `Mesa ${i}`;
            mesa.dataset.idMesa = i; // Asigna el ID de la mesa
            mesa.style.cursor = 'pointer'; // Cambia el cursor a pointer

            mesa.addEventListener('click', function() {
                // Resalta la mesa seleccionada
                document.querySelectorAll('.mesa').forEach(m => m.classList.remove('selected'));
                mesa.classList.add('selected');
            });

            mesasDiv.appendChild(mesa);
        }

        mesasContainer.style.display = 'block'; // Muestra el contenedor de mesas
        document.getElementById('confirmar-reserva').style.display = 'block'; // Muestra el botón de confirmar
    });

    document.getElementById('confirmar-reserva').addEventListener('click', function() {
        // Verifica que se haya seleccionado una mesa
        const selectedMesa = document.querySelector('.mesa.selected');
        if (!selectedMesa) {
            alert('Por favor, selecciona una mesa.');
            return;
        }

        // Obtiene los valores de los campos del formulario
        const nombre = document.getElementById('Nombre').value;
        const correo = document.getElementById('Correo').value;
        const fechaReserva = document.getElementById('Fecha').value;
        const horaReserva = document.getElementById('Horario').value;
        const cantidadPersonas = document.getElementById('Personas').value;
        const idMesa = selectedMesa.dataset.idMesa; // ID de la mesa seleccionada

        // Envía los datos al back-end
        fetch('http://localhost:3000/reservar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre,
                correo,
                fecha_reserva: fechaReserva,
                hora_reserva: horaReserva,
                cantidad_personas: cantidadPersonas,
                id_mesa: idMesa // Incluyendo el id_mesa en el cuerpo de la solicitud
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
            mesasContainer.style.display = 'none'; // Oculta las mesas
            document.getElementById('confirmar-reserva').style.display = 'none'; // Oculta el botón de confirmar
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema al realizar la reserva. Inténtalo de nuevo.');
        });
    });
});
