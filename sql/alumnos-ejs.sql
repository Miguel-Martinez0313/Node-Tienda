-- Elimina la base de datos si existe y crea una nueva
DROP DATABASE IF EXISTS alumnos_ejs;
CREATE DATABASE alumnos_ejs;
USE alumnos_ejs;

-- Creación de la tabla categorias primero, ya que productos depende de esta
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Creación de la tabla ofertas (ahora independiente)
CREATE TABLE ofertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descuento DECIMAL(5, 2) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATETIME,
    fecha_fin DATETIME
);

-- Creación de la tabla productos (con dependencia de ofertas)
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    cantidad_en_almacen INT NOT NULL,
    cantidad_vendida INT DEFAULT 0,
    categoria_id INT,
    oferta_id INT DEFAULT NULL,
    imagen VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (oferta_id) REFERENCES ofertas(id)
);

-- Creación de la tabla login
CREATE TABLE login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    contra VARCHAR(255) NOT NULL
);

-- Creación de la tabla roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Creación de la tabla permisos
CREATE TABLE permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    permiso_nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Creación de la tabla usuario_roles
CREATE TABLE usuario_roles (
    usuario_id INT,
    rol_id INT,
    FOREIGN KEY (usuario_id) REFERENCES login(id),
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Creación de la tabla rol_permisos
CREATE TABLE rol_permisos (
    rol_id INT,
    permiso_id INT,
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (permiso_id) REFERENCES permisos(id)
);

-- Creación de la tabla compras
CREATE TABLE compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    usuario_id INT,
    cantidad INT,
    precio_unitario DECIMAL(10, 2),
    fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (usuario_id) REFERENCES login(id)
);

-- Inserciones iniciales
INSERT INTO categorias (nombre, descripcion) VALUES
    ('Panadería', 'Productos frescos de panadería'),
    ('Repostería', 'Dulces y pasteles para todo tipo de ocasión');

INSERT INTO roles (rol_nombre, descripcion) VALUES
    ('Admin', 'Administrador con acceso total'),
    ('Comprador', 'Acceso limitado');

INSERT INTO permisos (permiso_nombre, descripcion) VALUES
    ('Crear', 'Permiso para crear nuevos registros'),
    ('Leer', 'Permiso para leer registros'),
    ('Actualizar', 'Permiso para actualizar registros'),
    ('Eliminar', 'Permiso para eliminar registros');

-- Usuario administrador de ejemplo. La contraseña ("1234567890") se guarda ya
-- cifrada con bcrypt; cámbiala después del primer inicio de sesión.
INSERT INTO login (nombre, email, contra) VALUES
    ('Miguel', 'example@gmail.com', '$2b$10$tLzK5knW8ftXV7rB3k5OHevze2VDNquQEmSfMeqzQnW38eIGCLbV2');

INSERT INTO usuario_roles (usuario_id, rol_id) VALUES
    (1, 1);

INSERT INTO rol_permisos (rol_id, permiso_id) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4);

INSERT INTO ofertas (descuento, descripcion, fecha_inicio, fecha_fin) VALUES
    (10.00, '10% de descuento en productos seleccionados', '2024-01-01', '2024-01-31'),
    (15.00, '15% de descuento en productos de repostería', '2024-02-01', '2024-02-28');

INSERT INTO productos (nombre, descripcion, precio, cantidad_en_almacen, cantidad_vendida, categoria_id, oferta_id) VALUES
    ('Pan Integral', 'Pan hecho con harina integral', 20.00, 50, 10, 1, 1),
    ('Croissant', 'Croissant de mantequilla fresco', 25.00, 30, 5, 2, NULL),
    ('Baguette', 'Pan baguette crujiente', 30.00, 40, 7, 1, 2),
    ('Hamburguesa', 'Pan de hamburguesa suave', 15.00, 100, 20, 1, NULL),
    ('Galleta', 'Galleta de chocolate casera', 10.00, 200, 50, 2, NULL),
    ('Galleta Salada', 'Galleta salada para acompañar', 12.00, 150, 25, 2, 2);
