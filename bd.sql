CREATE TABLE `administrador` (
  `id_admin` int NOT NULL AUTO_INCREMENT,
  `nombre_admin` varchar(100) DEFAULT NULL,
  `correo_admin` varchar(100) DEFAULT NULL,
  `celular_admin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_admin`)
) 

CREATE TABLE `clientes` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nombre_cliente` varchar(50) DEFAULT NULL,
  `correo_cliente` varchar(100) DEFAULT NULL,
  `celular` varchar(9) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`)
)

CREATE TABLE `noticia` (
  `id_noticia` int NOT NULL AUTO_INCREMENT,
  `descripcion_noticia` text,
  `fecha_noticia` date DEFAULT NULL,
  `id_admin` int DEFAULT NULL,
  PRIMARY KEY (`id_noticia`),
  KEY `id_admin` (`id_admin`),
  CONSTRAINT `noticia_ibfk_1` FOREIGN KEY (`id_admin`) REFERENCES `administrador` (`id_admin`)
)

CREATE TABLE `reserva` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `fecha_reserva` date DEFAULT NULL,
  `hora_reserva` time DEFAULT NULL,
  `cantidad_gente` int DEFAULT NULL,
  `estado_reserva` varchar(50) DEFAULT NULL,
  `id_mesa` int DEFAULT NULL,
  `id_cliente` int DEFAULT NULL,
  PRIMARY KEY (`id_reserva`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`)
)