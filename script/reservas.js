document.getElementById('elegir-mesa').addEventListener('click', function() {
    // Mostrar las mesas
    const mesasContainer = document.getElementById('mesas-container');
    mesasContainer.style.display = 'block';

    // Simulación de mesas disponibles
    const mesas = document.getElementById('mesas');
    mesas.innerHTML = '';  // Limpiar cualquier contenido previo

    for (let i = 1; i <= 6; i++) {
        const mesaBtn = document.createElement('button');
        mesaBtn.innerText = `${i}`;
        mesaBtn.classList.add('mesa-btn');
        mesaBtn.dataset.mesaId = i;

        mesaBtn.addEventListener('click', function() {
            // Selecciona la mesa y muestra el botón de confirmación
            document.querySelectorAll('.mesa-btn').forEach(btn => btn.classList.remove('selected'));
            mesaBtn.classList.add('selected');
            document.getElementById('confirmar-reserva').style.display = 'block';
            mesaSeleccionada = i;
        });

        mesas.appendChild(mesaBtn);
    }
});

document.getElementById('confirmar-reserva').addEventListener('click', function() {
    const nombre = document.getElementById('Nombre').value;
    const correo = document.getElementById('Correo').value;
    const celular = document.getElementById('celular').value;
    const cantidadGente = document.getElementById('Personas').value;
    const fechaReserva = document.getElementById('Fecha').value;
    const horario = document.getElementById('Horario').value;
    const mesa = mesaSeleccionada;

    if (!mesa) {
        alert("Por favor selecciona una mesa.");
        return;
    }

    // Crear el objeto con los datos de la reserva
    const reservaData = {
        nombre,
        correo,
        celular,
        cantidad_gente: cantidadGente,
        fecha_reserva: fechaReserva,
        hora_reserva: horario,
        mesa
    };

    // Enviar la solicitud al backend
    fetch('http://localhost:3000/reservar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservaData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Reserva realizada con éxito');
        } else {
            alert('Hubo un problema con la reserva.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
