const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware para parsear JSON y habilitar CORS
app.use(bodyParser.json());
app.use(cors());

// Conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'qwerasd13',
  database: 'sistema_reservas'
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos MySQL exitosa');
});

//funciones para las valdiaciones:

//valdiar fecha reserva
function validarFechaReserva(fecha, hora){
  const fechaActual = new Date();
  const fechaReserva = new Date(`${fecha}T${hora}`);

  return fechaReserva >= fechaActual;

}



// Ruta para crear una nueva reserva
app.post('/reservar', (req, res) => {
  const { nombre, correo, celular, fecha_reserva, hora_reserva, cantidad_gente, mesa } = req.body;
  console.log(req.body);

  // Validar campos vacíos
  
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
      VALUES (?, ?, ?, 'pendiente', ?, ?)`;

    db.query(reservaQuery, [fecha_reserva, hora_reserva, cantidad_gente, mesa, id_cliente], (err, result) => {
      if (err) {
        console.error('Error insertando reserva:', err);
        return res.status(500).json({ error: 'Error al insertar la reserva' });
      }

      res.status(200).json({ success: true, message: 'Reserva creada exitosamente' });
    });
  }
});


// Servidor escuchando en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});


