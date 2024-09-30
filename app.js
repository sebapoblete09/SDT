const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const port = 3000;

// Middleware para parsear JSON y habilitar CORS
app.use(bodyParser.json());
app.use(cors({
  origin: 'https://proyecto1-mocha.vercel.app' // Permitir solo este origen
}));


// Conexión a la base de datos MySQL

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
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
  const { nombre, correo, celular, fecha_reserva, hora_reserva, cantidad_gente, mesa } = req.body;
  console.log(req.body);
 
  
  // Validar que la fecha y hora no sean en el pasado
  if (!validarFechaReserva(fecha_reserva, hora_reserva)) {
    return res.status(400).json({ success: false, message: 'No puedes reservar una fecha y hora en el pasado' });
  }

  // Buscar si el cliente ya existe en la base de datos
  const clienteQuery = 'SELECT id_cliente FROM clientes WHERE correo_cliente = ?';

  db.query(clienteQuery, [correo], (err, results) => {
    if (err) {
      console.error('Error buscando cliente:', err);
      return res.status(500).json({ error: 'Error al buscar el cliente' });
    }

    let id_cliente;

    if (results.length > 0) {
      // Cliente ya existe
      id_cliente = results[0].id_cliente;
      verificarMesaYCrearReserva(id_cliente);
    } else {
      // Cliente no existe, insertarlo
      const insertClienteQuery = 'INSERT INTO clientes (nombre_cliente, correo_cliente, celular) VALUES (?, ?, ?)';
      db.query(insertClienteQuery, [nombre, correo, celular], (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            db.query(clienteQuery, [correo], (err, results) => {
              if (err) {
                console.error('Error buscando cliente:', err);
                return res.status(500).json({ error: 'Error al buscar el cliente' });
              }
              id_cliente = results[0].id_cliente;
              verificarMesaYCrearReserva(id_cliente);
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
    const verificarMesaOcupadaQuery = `
      SELECT * FROM reserva 
      WHERE id_mesa = ? AND fecha_reserva = ? AND hora_reserva = ?`;

    db.query(verificarMesaOcupadaQuery, [mesa, fecha_reserva, hora_reserva], (err, results) => {
      if (err) {
        console.error('Error al verificar la mesa:', err);
        return res.status(500).json({ error: 'Error al verificar la mesa' });
      }

      if (results.length > 0) {
        return res.status(400).json({ success: false, message: 'La mesa seleccionada ya está reservada para esa fecha y hora' });
      }

      // Si la mesa no está ocupada, crear la reserva
      createReservation(id_cliente);
    });
  }

  function createReservation(id_cliente) {
    const reservaQuery = `
      INSERT INTO reserva 
      (fecha_reserva, hora_reserva, cantidad_gente, estado_reserva, id_mesa, id_cliente) 
      VALUES (?, ?, ?, 'completado', ?, ?)`;

    db.query(reservaQuery, [fecha_reserva, hora_reserva, cantidad_gente, mesa, id_cliente], (err, result) => {
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
  const { nombre, correo, celular,codReserva} = req.body;
  console.log(req.body);
 
  

  // Buscar si el cliente ya existe en la base de datos
  const clienteQuery = 'SELECT id_cliente FROM clientes WHERE correo_cliente = ?';

  db.query(clienteQuery, [correo], (err, results) => {
    if (err) {
      console.error('Error buscando cliente:', err);
      return res.status(500).json({ error: 'Error al buscar el cliente' });
    }

    let id_cliente;

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

        if(results.length>0){
          cancelReservation(id_cliente); 
        } else{return res.status(400).json({ success: false, message: 'No tienes ninguna reserva con este codigo' });}
        
      })
      
    } else {
      return res.status(400).json({ success: false, message: 'los datos del cliente no existen, intente nuevamente' });
    }
  });


  

  function cancelReservation(id_cliente) {
    const reservaQuery = `
      update reserva 
      set estado_reserva = 'cancelada'
      where id_reserva = ? `;

    db.query(reservaQuery, [codReserva], (err, result) => {
      if (err) {
        console.error('Error cancelando reserva:', err);
        return res.status(500).json({ error: 'Error al cancelar la reserva' });
      }

      
      res.status(200).json({ success: true, message: 'Reserva cancelada exitosamente' });
    });
  }
});


// Servidor escuchando en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});


