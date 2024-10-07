// alternar entre los formularios
document.getElementById("registrarse").addEventListener("click", function() {
    document.querySelector(".container-form").style.display = "none"; // Oculta el formulario de inicio de sesión
    document.getElementById("create-account").style.display = "block"; // Muestra el formulario de registro
});

document.getElementById("volver-login").addEventListener("click", function() {
    document.querySelector(".Create-account").style.display = "none"; // Oculta el formulario de inicio de sesión
    document.getElementById("container-form").style.display = "block"; // Muestra el formulario de registro
});


document.getElementById("crear-cuenta").addEventListener("click", function() {
    
    const nombre = document.getElementById('Nombre').value;
    const correo = document.getElementById('Correo').value;
    const celular = document.getElementById('celular').value;
    const password = document.getElementById('password').value;

    //validacion para no dejar un campo vacio
    if(!nombre || !correo || !celular|| !password) {
        alert("Por favor complete todos los campos")
        return
    };

    // Validar formato de correo, por el momento, puede cambiar al aplicar la autenticacion para iniciar sesion
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Patrón general para validar el formato de un correo
    if (!emailPattern.test(correo)) {
        alert("Por favor ingrese un correo válido");
        return;
    }

    const user = {
        nombre,
        correo,
        celular,
        password
    };

    // Enviar la solicitud al backend
    fetch('http://localhost:3000/CrearUsuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then (data =>{
        if(data.success){
            alert('Regristo exitoso');
            
            
        }
        else{
            alert(data.message);
        }
    })
    .catch(error => {
        alert('Hubo un error al crear la cuenta. Intente nuevamente más tarde.');
        console.error('Error:', error);
    });
    

    
});

// alternar entre los formularios
document.getElementById("registrarse").addEventListener("click", function() {
    document.querySelector(".container-form").style.display = "none"; // Oculta el formulario de inicio de sesión
    document.getElementById("create-account").style.display = "block"; // Muestra el formulario de registro
});

document.getElementById("volver-login").addEventListener("click", function() {
    document.querySelector(".Create-account").style.display = "none"; // Oculta el formulario de inicio de sesión
    document.getElementById("container-form").style.display = "block"; // Muestra el formulario de registro
});


document.getElementById("iniciar-sesion").addEventListener("click", function() {

    const correo = document.getElementById('Correo').value;
    const password = document.getElementById('password-login').value;

    //validacion para no dejar un campo vacio
    if( !correo ||!password) {
        alert("Por favor complete todos los campos")
        return
    };

    // Validar formato de correo, por el momento, puede cambiar al aplicar la autenticacion para iniciar sesion
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Patrón general para validar el formato de un correo
    if (!emailPattern.test(correo)) {
        alert("Por favor ingrese un correo válido");
        return;
    }

    const user = {
        correo,
        password
    };

    // Enviar la solicitud al backend
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then (data =>{
        if(data.success){
            // Almacenar el token en el localStorage
            localStorage.setItem('token', data.token);
            alert('Inicio de sesión exitoso');
        }
        else{
            alert(data.message);
        }
    })
    .catch(error => {
        alert('Hubo un error al iniciar sesion. Intente nuevamente más tarde.');
        console.error('Error:', error);
    });
    

    
});