// api/sendEmail.js
import emailjs from 'emailjs-com';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { nombre, correo, fecha_reserva, hora_reserva, cantidad_gente, mesa } = req.body;

        const templateParams = {
            from_name: nombre,
            to_name: "Sabores de la tierra", 
            to_email: correo,
            message: `Hola ${nombre}, tu reserva ha sido confirmada. \
                    Datos de la reserva: \
                    Fecha: ${fecha_reserva} \
                    Hora: ${hora_reserva} \
                    Número de mesa: ${mesa} \
                    Capacidad de la mesa: ${cantidad_gente} \
                    ¡Te esperamos!`
        };

        try {
            await emailjs.send('service_0zlplsv', 'template_rqpmnbl', templateParams);
            res.status(200).json({ message: 'Correo enviado con éxito!' });
        } catch (error) {
            res.status(500).json({ message: 'Error al enviar el correo.', error });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
