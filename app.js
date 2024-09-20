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
  user: 'root', // Cambia esto si tu usuario no es root
  password: 'qwerasd13', // Cambia esto por tu contraseña
  database: 'prueba2' // Cambia esto por el nombre de tu base de datos
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos MySQL exitosa');
});

// Ruta para crear una nueva reserva
app.post('/reservar', (req, res) => {
  const { nombre, correo, fecha_Reserva, hora_reserva, cantidad_Gente } = req.body;

  // Primero, insertamos los datos del cliente
  const clienteQuery = 'INSERT INTO pruebas (nombre, correo) VALUES (?, ?)';
  
  db.query(clienteQuery, [nombre, correo], (err, result) => {
    if (err) {
      console.error('Error insertando cliente:', err);
      res.status(500).json({ error: 'Error al insertar el cliente' });
      return;
    }

    const id_cliente = result.insertId; // Obtenemos el id del cliente insertado

    // Ahora insertamos la reserva usando el id_cliente
    const reservaQuery = `INSERT INTO reserva 
      (fecha_Reserva, hora_reserva, cantidad_Gente, estado_reserva, id_cliente) 
      VALUES (?, ?, ?, 'pendiente', ?)`;

    db.query(reservaQuery, [fecha_Reserva, hora_reserva, cantidad_Gente, id_cliente], (err, result) => {
      if (err) {
        console.error('Error insertando reserva:', err);
        res.status(500).json({ error: 'Error al insertar la reserva' });
        return;
      }

      res.status(200).json({ message: 'Reserva creada exitosamente' });
    });
  });
});

// Ruta para obtener las reservas por cliente (opcional)
app.get('/reservas/:correo', (req, res) => {
  const { correo } = req.params;

  const query = `SELECT r.fecha_Reserva, r.hora_reserva, r.cantidad_Gente, r.estado_reserva
                 FROM reserva r
                 JOIN pruebas p ON r.id_cliente = p.id_cliente
                 WHERE p.correo = ?`;

  db.query(query, [correo], (err, results) => {
    if (err) {
      console.error('Error obteniendo reservas:', err);
      res.status(500).json({ error: 'Error al obtener las reservas' });
      return;
    }

    res.status(200).json(results);
  });
});

// Ruta para actualizar el estado de una reserva (opcional)
app.put('/reservas/:id', (req, res) => {
  const { id } = req.params;
  const { estado_reserva } = req.body;

  const query = 'UPDATE reserva SET estado_reserva = ? WHERE id_reserva = ?';

  db.query(query, [estado_reserva, id], (err, result) => {
    if (err) {
      console.error('Error actualizando reserva:', err);
      res.status(500).json({ error: 'Error al actualizar la reserva' });
      return;
    }

    res.status(200).json({ message: 'Estado de la reserva actualizado exitosamente' });
  });
});

// Servidor escuchando en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
