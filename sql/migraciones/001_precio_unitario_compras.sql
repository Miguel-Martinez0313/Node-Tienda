-- Guarda el precio pagado en cada compra para conservar el historial aunque cambie el precio del producto.
-- Ejecutar una sola vez en bases de datos creadas antes de este cambio.
USE alumnos_ejs;

ALTER TABLE compras ADD COLUMN precio_unitario DECIMAL(10, 2) AFTER cantidad;

-- Las compras antiguas toman el precio actual del producto como mejor aproximación
UPDATE compras c
JOIN productos p ON c.producto_id = p.id
SET c.precio_unitario = p.precio
WHERE c.precio_unitario IS NULL;
