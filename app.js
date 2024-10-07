
const express = require('express');// para trabajar en un servidor local
const mysql = require('mysql'); // necesario para conectar la bd
const bodyParser = require('body-parser');//se utiliza para procesar los datos enviados en el cuerpo (body) de las solicitudes HTTP
const cors = require('cors'); //permite que el servidor acepte solicitudes de otros dominios.
const jwt = require('jsonwebtoken'); // nuevo para trabajar con JWT

//crea el servidor local, en el puerto 3000
const app = express();
const port = 3000;

// Middleware para parsear JSON y habilitar CORS
app.use(bodyParser.json());
app.use(cors());

const SECRET_KEY = 'tu_clave_secreta';



// Conexión a la base de datos MySQL, recuerda crear la base de datos en tu pc
const db = mysql.createConnection({
  host:'localhost',
  user: 'root',
  password: 'qwerasd13',
  database: 'sistema_reservas' ,
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos MySQL exitosa');
});


//valdiar fecha reserva
function validarFechaReserva(fecha, hora){
  const fechaActual = new Date();
  const fechaReserva = new Date(`${fecha}T${hora}`);

  return fechaReserva >= fechaActual;

}

app.post('/CrearUsuario',(req, res) => {

  // crear las constantes que reciben los datos del formulario
  const { nombre, correo, celular, password} = req.body;
  console.log(req.body);

   // Buscar si el cliente ya existe en la base de datos
   const clienteQuery = 'SELECT id_cliente FROM clientes WHERE correo_cliente = ?';

   //si el correo ya esta en la bd, el cliente existe
  db.query(clienteQuery, [correo], (err, results) => {

    // si hay un error al buscar el cliente
    if (err) {
      console.error('Error buscando cliente:', err);
      return res.status(500).json({ error: 'Error al buscar el cliente' });
      
    }

    //si hay mas de 1 resultado en el select, quiere decir que el cliente existe
    if (results.length > 0) {
      // Cliente ya existe
      console.error("El cliente ya está registrado anteriormente")
      return res.status(500).json({ error: 'Cliente ya registrado' });
    } else {
      // Cliente no existe, insertarlo
      //crea una constante para ejecutar el insert
      const insertClienteQuery = 'INSERT INTO clientes (nombre_cliente, correo_cliente, celular,password_cliente) VALUES (?, ?, ?,?)';
      db.query(insertClienteQuery, [nombre, correo, celular,password], (err, result) => {//realiza la query, pasando los valores almacenados en las constantes
        
        if (err) {//repite el proceso de verificar el cliente con el correo y guardar la id del cliente
          if (err.code === 'ER_DUP_ENTRY') {
            db.query(clienteQuery, [correo], (err, results) => {
              if (err) {
                console.error('Error buscando cliente:', err);
                return res.status(500).json({ error: 'Error al buscar el cliente' });
              }
              
            });
          } else {
            console.error('Error insertando cliente:', err);
            return res.status(500).json({ error: 'Error al insertar el cliente' });
          }
        } else {
          res.status(200).json({ success: true, message: 'Registro completado' })
        }
      });
    }
  });

})

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
  const { correo, password } = req.body;

  // Verificar si el usuario existe en la base de datos
  const query = 'SELECT * FROM clientes WHERE correo_cliente = ? AND password_cliente = ?';
  db.query(query, [correo, password], (err, results) => {
    if (err) {
      console.error('Error buscando usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length > 0) {
      // Usuario encontrado, generar token JWT
      const user = { id: results[0].id_cliente, correo: results[0].correo_cliente };

      // Firmar el token con el id y correo del usuario
      const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' }); // Expira en 1 hora

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        token, // Se envía el token al cliente
      });
    } else {
      return res.status(400).json({ success: false, message: 'Credenciales incorrectas' });
    }
  });
});

// Middleware para verificar el token JWT
function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado. No hay token.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Guardar la información del usuario decodificada
    req.user = decoded;
    next();
  });
}

// Ruta protegida que solo pueden acceder usuarios autenticados
app.get('/perfil', verificarToken, (req, res) => {
  res.status(200).json({ success: true, message: 'Accediste a una ruta protegida', user: req.user });
});


function obtenerPerfil() {
  const token = localStorage.getItem('token');

  fetch('http://localhost:3000/perfil', {
      method: 'GET',
      headers: {
          'Authorization': token // Enviar el token en las cabeceras
      }
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          console.log('Perfil del usuario:', data.user);
      } else {
          alert('No se pudo acceder a la información del perfil.');
      }
  })
  .catch(error => {
      console.error('Error al obtener el perfil:', error);
  });
}


app.post('/reservar', (req, res) => {

  // crear las constantes que reciben los datos del formulario
  const { nombre, correo, celular, fecha_reserva, hora_reserva, cantidad_gente, mesa } = req.body;
  console.log(req.body);
 
  
  // Validar que la fecha y hora no sean en el pasado
  if (!validarFechaReserva(fecha_reserva, hora_reserva)) {//si es false,  es una fecha anterior
    return res.status(400).json({ success: false, message: 'No puedes reservar una fecha y hora en el pasado' });
  }

  // Buscar si el cliente ya existe en la base de datos
  const clienteQuery = 'SELECT id_cliente FROM clientes WHERE correo_cliente = ?';

//si el correo ya esta en la bd, el cliente existe
  db.query(clienteQuery, [correo], (err, results) => {

    // si hay un error al buscar el cliente
    if (err) {
      console.error('Error buscando cliente:', err);
      return res.status(500).json({ error: 'Error al buscar el cliente' });
    }

    //si no lo hay, crea una variable id_cliente
    let id_cliente;

    //si hay mas de 1 resultado en el select, quiere decir que el cliente existe
    if (results.length > 0) {
      // Cliente ya existe
      id_cliente = results[0].id_cliente;//guardamos la id del cliente sacada de la bd, en la constante anteriormente creada
      verificarMesaYCrearReserva(id_cliente);//llama a la funcion para validar la mesa y crear reserva
    } else {
      // Cliente no existe, insertarlo
      //crea una constante para ejecutar el insert
      const insertClienteQuery = 'INSERT INTO clientes (nombre_cliente, correo_cliente, celular) VALUES (?, ?, ?)';
      db.query(insertClienteQuery, [nombre, correo, celular], (err, result) => {//realiza la query, pasando los valores almacenados en las constantes
        
        if (err) {//repite el proceso de verificar el cliente con el correo y guardar la id del cliente
          if (err.code === 'ER_DUP_ENTRY') {
            db.query(clienteQuery, [correo], (err, results) => {
              if (err) {
                console.error('Error buscando cliente:', err);
                return res.status(500).json({ error: 'Error al buscar el cliente' });
              }
              id_cliente = results[0].id_cliente;
              verificarMesaYCrearReserva(id_cliente);//llama la funcion para verificar la mesa para el cliente recien añadido
            });
          } else {
            console.error('Error insertando cliente:', err);
            return res.status(500).json({ error: 'Error al insertar el cliente' });
          }
        } else {
          id_cliente = result.insertId;
          verificarMesaYCrearReserva(id_cliente);
        }
      });
    }
  });

  function verificarMesaYCrearReserva(id_cliente) {

    //constante para guardar las reservas que tengas una id_mesa, fecha_Reserva y hora_reserva especifica
    const verificarMesaOcupadaQuery = `
      SELECT * FROM reserva 
      WHERE id_mesa = ? AND fecha_reserva = ? AND hora_reserva = ?`;

    db.query(verificarMesaOcupadaQuery, [mesa, fecha_reserva, hora_reserva], (err, results) => {
      if (err) {
        console.error('Error al verificar la mesa:', err);
        return res.status(500).json({ error: 'Error al verificar la mesa' });
      }

      //si existe mas de 1 registro, quiere decir que la emsa ya esta ocupada en esa fecha/hora
      if (results.length > 0) {
        return res.status(400).json({ success: false, message: 'La mesa seleccionada ya está reservada para esa fecha y hora' });
      }

      // Si la mesa no está ocupada, crear la reserva
      createReservation(id_cliente);
    });
  }

  function createReservation(id_cliente) {

    //constante que realiza el insert de la reserva
    const reservaQuery = `
      INSERT INTO reserva 
      (fecha_reserva, hora_reserva, cantidad_gente, estado_reserva, id_mesa, id_cliente) 
      VALUES (?, ?, ?, 'completado', ?, ?)`;

    db.query(reservaQuery, [fecha_reserva, hora_reserva, cantidad_gente, mesa, id_cliente], (err, result) => {

      //si existe algun error en la insercion
      if (err) {
        console.error('Error insertando reserva:', err);
        return res.status(500).json({ error: 'Error al insertar la reserva' });
      }      
      res.status(200).json({ success: true, message: 'Reserva creada exitosamente' });
    });
  }
});


// Ruta para cancelar una nueva reserva
app.put('/cancelar', (req, res) => {

  // crear las constantes que reciben los datos del formulario
  const { nombre, correo, celular,codReserva} = req.body;
  console.log(req.body);
 
  

  // Buscar si el cliente ya existe en la base de datos
  const clienteQuery = 'SELECT id_cliente FROM clientes WHERE correo_cliente = ?';

  db.query(clienteQuery, [correo], (err, results) => {
    if (err) {
      console.error('Error buscando cliente:', err);
      return res.status(500).json({ error: 'Error al buscar el cliente' });
    }

    let id_cliente;//crea una variable para guardar la id_cliente

    if (results.length > 0) {
      // Cliente ya existe
      id_cliente = results[0].id_cliente;

      //verificar si al cliente le corresponde ese codigo de reserva
      const verificarCliente = 'SELECT * from reserva where id_Cliente = ? and id_reserva = ?'

      db.query(verificarCliente, [id_cliente, codReserva], (err,results) => {
        if (err) {
          console.error('Error verificando cliente:',err);
          return results.status(500).json({error: 'erros verificando reserva del cliente'});
        }

        //si existe un registro con ese codigo de reserva, llamar a funcion para cancelar la reserva
        if(results.length>0){
          cancelReservation(id_cliente); 
        } else{return res.status(400).json({ success: false, message: 'No tienes ninguna reserva con este codigo' });}
        
      })
      
    } else {
      return res.status(400).json({ success: false, message: 'los datos del cliente no existen, intente nuevamente' });
    }
  });


  

  function cancelReservation(id_cliente) {

    //constante para realizar el cambio del estado de la reserva
    const reservaQuery = `
      update reserva 
      set estado_reserva = 'cancelada'
      where id_reserva = ? `;

    db.query(reservaQuery, [codReserva], (err, result) => {

      //si ocurre algun error al hacer el update
      if (err) {
        console.error('Error cancelando reserva:', err);
        return res.status(500).json({ error: 'Error al cancelar la reserva' });
      }

      //si se realizao el cambio correctamente
      res.status(200).json({ success: true, message: 'Reserva cancelada exitosamente' });
    });
  }
});

// Endpoint para obtener todas las reservas de un usuario específico
// Endpoint para obtener todas las reservas de un usuario específico
app.get('/mostrar', (req, res) => {
  const correo = req.query.correo; // Obtiene el correo del usuario desde los parámetros de la URL

  // Consulta SQL para obtener el ID del cliente basado en su correo
  const clienteQuery = 'SELECT id_cliente FROM clientes WHERE correo_cliente = ?';

  db.query(clienteQuery, [correo], (err, results) => {
      if (err) {
          console.error('Error buscando cliente:', err);
          return res.status(500).json({ error: 'Error al buscar el cliente' });
      }

      // Verificar si se encontró el cliente
      if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
      }

      const id_cliente = results[0].id_cliente; // Se obtiene el ID del cliente

      // Consulta SQL para obtener las reservas del usuario
      const selectQuery = 'SELECT * FROM reserva WHERE id_cliente = ?';

      db.query(selectQuery, [id_cliente], (err, results) => {
          if (err) {
              console.error('Error al obtener reservas:', err);
              return res.status(500).json({ success: false, message: 'Error al obtener reservas: ' + err.message });
          }

          // Verifica si se encontraron reservas
          if (results.length === 0) {
              return res.status(404).json({ success: false, message: 'No se encontraron reservas para este usuario' });
          }

          // Si se encuentran reservas, se envían en la respuesta
          return res.json({ success: true, reservas: results });
      });
  });
});



// Servidor escuchando en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});


