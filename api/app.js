
const express = require('express');// para trabajar en un servidor local
const mysql = require('mysql'); // necesario para conectar la bd
const bodyParser = require('body-parser');//se utiliza para procesar los datos enviados en el cuerpo (body) de las solicitudes HTTP
const cors = require('cors'); //permite que el servidor acepte solicitudes de otros dominios.

//crea el servidor local, en el puerto 3000
const app = express();
const port = 3000;

// Middleware para parsear JSON y habilitar CORS
app.use(bodyParser.json());
app.use(cors());



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


// Servidor escuchando en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});


