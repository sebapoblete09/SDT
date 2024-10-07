document.getElementById('elegir-mesa').addEventListener('click', function() {

    // Mostrar las mesas
    const mesasContainer = document.getElementById('mesas-container');
    mesasContainer.style.display = 'block';

    // Simulación de mesas disponibles
    const mesas = document.getElementById('mesas');
    mesas.innerHTML = '';  // Limpiar cualquier contenido previo

    
    for (let i = 1; i <= 6; i++) {
        // crea 6 botones para las mesas con su class, id e innertext correspondiente
        const mesaBtn = document.createElement('button');
        mesaBtn.innerText = `${i}`;
        mesaBtn.classList.add('mesa-btn');
        mesaBtn.dataset.mesaId = i;

        //al hacer click en una mesa
        mesaBtn.addEventListener('click', function() {
            // Selecciona la mesa y muestra el botón de confirmación
            document.querySelectorAll('.mesa-btn').forEach(btn => btn.classList.remove('selected'));
            mesaBtn.classList.add('selected');
            document.getElementById('confirmar-reserva').style.display = 'block';
            mesaSeleccionada = i;//almacena la id de la mesa
        });

        mesas.appendChild(mesaBtn);//agrega la mesa al front
    }
});


document.getElementById('confirmar-reserva').addEventListener('click', function() {

    //constantes que almacenan el valor guardados en los elementos con sus respectivas id
    const nombre = document.getElementById('Nombre').value;
    const correo = document.getElementById('Correo').value;
    const celular = document.getElementById('celular').value;
    const cantidadGente = document.getElementById('Personas').value;
    const fechaReserva = document.getElementById('Fecha').value;
    const horario = document.getElementById('Horario').value;
    const mesa = mesaSeleccionada;

    //validacion para no dejar un campo vacio
    if(!nombre || !correo || !celular|| !fechaReserva || !horario || !cantidadGente || !mesa){
        alert("Por favor complete todos los campos")
        return
    };

    // Validar formato de correo, por el momento, puede cambiar al aplicar la autenticacion para iniciar sesion
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Patrón general para validar el formato de un correo
    if (!emailPattern.test(correo)) {
        alert("Por favor ingrese un correo válido");
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
    .then (data =>{
        if(data.success){
            alert('Reserva creada con exito');
        }
        else{
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

//eliminar reserva

document.getElementById('cancelar-reserva').addEventListener('click', function() {

    //constantes para guardar el valor que tiene cada elemento del form segun su id
    const nombre = document.getElementById('Nombre-cancelar').value;
    const correo = document.getElementById('Correo-cancelar').value;
    const celular = document.getElementById('celular-cancelar').value;
    const codReserva = parseInt(document.getElementById('codReserva').value);
    

    //validar que no haya campos vacios
    if(!nombre || !correo || !celular || !codReserva){
        alert("Por favor complete todos los campos")
        return
    };

    // Validar formato de correo
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Patrón general para validar el formato de un correo
    if (!emailPattern.test(correo)) {
        alert("Por favor ingrese un correo válido");
        return;
    }




    // Crear el objeto con los datos de la reserva
    const reservaData = {
        nombre,
        correo,
        celular,
        codReserva
    };

    // Enviar la solicitud al backend
    fetch('http://localhost:3000/cancelar', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservaData)
    })
    .then(response => response.json())
    .then (data =>{
        if(data.success){
            alert('Reserva cancelada con exito');
        }
        else{
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});







