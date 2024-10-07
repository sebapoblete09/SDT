document.getElementById('mostrat-res').addEventListener('click', function() {
    const correo = document.getElementById('Correo').value; // Asegúrate de tener un campo de entrada con id="Correo"

    // Validar que no haya campos vacíos
    if (!correo) {
        alert("Por favor complete todos los campos");
        return;
    }

    // Validar formato de correo
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Patrón general para validar el formato de un correo
    if (!emailPattern.test(correo)) {
        alert("Por favor ingrese un correo válido");
        return;
    }

    // Enviar la solicitud al backend
    fetch(`http://localhost:3000/mostrar?correo=${encodeURIComponent(correo)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const reservasContainer = document.getElementById('reservas'); // Asegúrate de tener un contenedor para mostrar las reservas

        // Limpiar el contenedor de reservas antes de mostrar nuevas
        reservasContainer.innerHTML = '';

        if (data.success) {
            // Crear una tabla para mostrar las reservas
            const table = document.createElement('table');
            const header = document.createElement('tr');
            header.innerHTML = `<th>ID Reserva</th><th>Fecha</th><th>Hora</th><th>Cantidad de Gente</th><th>Estado</th><th>ID Mesa</th>`;
            table.appendChild(header);

            data.reservas.forEach(reserva => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reserva.id_reserva}</td>
                    <td>${reserva.fecha_reserva}</td>
                    <td>${reserva.hora_reserva}</td>
                    <td>${reserva.cantidad_gente}</td>
                    <td>${reserva.estado_reserva}</td>
                    <td>${reserva.id_mesa}</td>
                `;
                table.appendChild(row);
            });

            reservasContainer.appendChild(table);
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
