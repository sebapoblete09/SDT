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
  database: 'sistema_reservas' // Cambia esto por el nombre de tu base de datos
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos MySQL exitosa');
});

// Ruta para crear una nueva reserva con el ID de la mesa
app.post('/reservar', (req, res) => {
  const { nombre, correo, fecha_reserva, hora_reserva, cantidad_personas, id_mesa } = req.body;

  // Primero, insertamos los datos del cliente
  const clienteQuery = 'INSERT INTO clientes (nombre_cliente, correo_cliente) VALUES (?, ?)';

  db.query(clienteQuery, [nombre, correo], (err, result) => {
    if (err) {
      console.error('Error insertando cliente:', err);
      res.status(500).json({ error: 'Error al insertar el cliente' });
      return;
    }

    const id_cliente = result.insertId; // Obtenemos el ID del cliente insertado

    // Ahora insertamos la reserva usando el id_cliente y id_mesa
    const reservaQuery = `
      INSERT INTO reservas 
      (fecha_reserva, hora_reserva, cantidad_personas, estado_reserva, id_cliente, id_mesa) 
      VALUES (?, ?, ?, 'pendiente', ?, ?)`;

    db.query(reservaQuery, [fecha_reserva, hora_reserva, cantidad_personas, id_cliente, id_mesa], (err, result) => {
      if (err) {
        console.error('Error insertando reserva:', err);
        res.status(500).json({ error: 'Error al insertar la reserva' });
        return;
      }

      res.status(200).json({ message: 'Reserva creada exitosamente' });
    });
  });
});

// Servidor escuchando en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
