-- ============================================================================
-- DATOS DE EJEMPLO PARA MARKETPLACE UPEM
-- ============================================================================
-- IMPORTANTE: Primero debes tener al menos un usuario registrado en la app
-- Luego ejecuta este script reemplazando 'TU_USER_ID' con tu UUID real
-- ============================================================================

-- 1. Obtener tu user_id (ejecuta esta query primero para ver tu ID)
SELECT id, email, full_name FROM profiles;

-- 2. Reemplaza 'TU_USER_ID' en las siguientes inserts con tu UUID real

-- ============================================================================
-- PRODUCTOS DE EJEMPLO
-- ============================================================================

-- Categoría: Libros
INSERT INTO products (user_id, title, description, price, category, condition, location, available)
VALUES 
  ('TU_USER_ID', 'Cálculo Diferencial e Integral - James Stewart 7ma Ed', 
   'Libro en excelente estado, casi sin uso. Incluye todos los ejercicios resueltos y apuntes adicionales. Perfecto para estudiantes de ingeniería. Tiene todas las páginas intactas sin marcas ni subrayados importantes.', 
   250.00, 'Libros', 'Usado', 'Edificio A - Campus Principal', true),
   
  ('TU_USER_ID', 'Álgebra Lineal - Stanley Grossman 6ta Ed', 
   'Libro usado pero en buen estado. Algunas páginas tienen subrayados con lápiz. Ideal para Álgebra Lineal I y II.', 
   200.00, 'Libros', 'Usado', 'Biblioteca Central', true),
   
  ('TU_USER_ID', 'Física para Ingeniería - Serway & Jewett', 
   'Libro prácticamente nuevo, solo utilizado un semestre. Sin marcas ni subrayados. Incluye solucionario digital.', 
   350.00, 'Libros', 'Nuevo', 'Edificio B - Laboratorios', true),
   
  ('TU_USER_ID', 'Química General - Raymond Chang 10ma Ed', 
   'Libro en buen estado general. Algunas páginas dobladas pero legibles. Perfecto para Química I.', 
   220.00, 'Libros', 'Usado', 'Edificio C - Aulas', true);

-- Categoría: Electrónicos
INSERT INTO products (user_id, title, description, price, category, condition, location, available)
VALUES 
  ('TU_USER_ID', 'Laptop HP Pavilion Core i5 8GB RAM 256GB SSD', 
   'Laptop en excelente estado funcional. Core i5 8va generación, 8GB RAM, SSD de 256GB. Perfecta para programación y diseño. Incluye cargador original. Batería dura aproximadamente 4 horas.', 
   5500.00, 'Electrónicos', 'Usado', 'Cafetería Principal', true),
   
  ('TU_USER_ID', 'Calculadora Científica Casio fx-991EX', 
   'Calculadora prácticamente nueva, solo un semestre de uso. Con caja y manual originales. Ideal para cálculo, álgebra y física.', 
   450.00, 'Electrónicos', 'Nuevo', 'Edificio A - Campus Principal', true),
   
  ('TU_USER_ID', 'Mouse Inalámbrico Logitech M185', 
   'Mouse inalámbrico en perfectas condiciones. Incluye receptor USB. Batería incluida. Funciona perfectamente.', 
   150.00, 'Electrónicos', 'Usado', 'Biblioteca Central', true),
   
  ('TU_USER_ID', 'Audífonos Bluetooth Sony WH-CH510', 
   'Audífonos bluetooth con muy poco uso. Excelente calidad de sonido. Batería dura todo el día. Con estuche y cable de carga.', 
   800.00, 'Electrónicos', 'Usado', 'Edificio B - Laboratorios', true);

-- Categoría: Ropa
INSERT INTO products (user_id, title, description, price, category, condition, location, available)
VALUES 
  ('TU_USER_ID', 'Sudadera UPEM Oficial Talla M', 
   'Sudadera oficial de la universidad en excelente estado. Color guinda con logo bordado. Talla M. Perfecta para el frío.', 
   350.00, 'Ropa', 'Usado', 'Cafetería Principal', true),
   
  ('TU_USER_ID', 'Playera de Ingeniería Mecatrónica Talla L', 
   'Playera de generación 2023 en muy buen estado. Talla L. Color negro con diseño especial.', 
   120.00, 'Ropa', 'Usado', 'Edificio A - Campus Principal', true);

-- Categoría: Apuntes
INSERT INTO products (user_id, title, description, price, category, condition, location, available)
VALUES 
  ('TU_USER_ID', 'Apuntes Completos de Termodinámica', 
   'Apuntes escaneados del semestre completo de Termodinámica I. Incluye ejercicios resueltos y formularios. Formato PDF, se envía por email.', 
   80.00, 'Apuntes', 'Nuevo', 'Edificio B - Laboratorios', true),
   
  ('TU_USER_ID', 'Formulario Completo de Cálculo Integral', 
   'Formulario impreso con todas las fórmulas de Cálculo Integral. Incluye ejemplos resueltos. 15 páginas a color.', 
   40.00, 'Apuntes', 'Nuevo', 'Biblioteca Central', true),
   
  ('TU_USER_ID', 'Resúmenes de Programación Orientada a Objetos', 
   'Resúmenes de todo el temario de POO con ejemplos en Java y C++. Incluye diagramas UML. Formato PDF.', 
   60.00, 'Apuntes', 'Nuevo', 'Edificio C - Aulas', true);

-- Categoría: Otros
INSERT INTO products (user_id, title, description, price, category, condition, location, available)
VALUES 
  ('TU_USER_ID', 'Mochila para Laptop 15.6 pulgadas', 
   'Mochila resistente con compartimento acolchado para laptop. Múltiples bolsillos. Color negro. En buen estado.', 
   280.00, 'Otros', 'Usado', 'Cafetería Principal', true),
   
  ('TU_USER_ID', 'Juego de Geometría Completo', 
   'Juego de geometría profesional con compás, escuadras y transportador. Todo en estuche rígido. Prácticamente nuevo.', 
   90.00, 'Otros', 'Nuevo', 'Edificio A - Campus Principal', true),
   
  ('TU_USER_ID', 'Lonchera Térmica', 
   'Lonchera térmica en excelente estado. Mantiene la comida caliente/fría por horas. Color azul. Fácil de limpiar.', 
   150.00, 'Otros', 'Usado', 'Cafetería Principal', true);

-- ============================================================================
-- NOTIFICACIÓN DE BIENVENIDA
-- ============================================================================

-- Crear notificación de bienvenida (opcional)
INSERT INTO notifications (user_id, type, title, message, is_read)
VALUES 
  ('TU_USER_ID', 'system', 
   '¡Bienvenido al Marketplace UPEM!', 
   'Gracias por unirte a nuestra comunidad. Aquí podrás comprar y vender productos de segunda mano de manera segura entre estudiantes.', 
   false);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que los productos se crearon correctamente
SELECT 
  title, 
  price, 
  category, 
  condition, 
  location,
  created_at
FROM products 
WHERE user_id = 'TU_USER_ID'
ORDER BY created_at DESC;

-- Contar productos por categoría
SELECT 
  category, 
  COUNT(*) as total,
  AVG(price) as precio_promedio
FROM products 
WHERE user_id = 'TU_USER_ID'
GROUP BY category;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

/*
1. Este script crea 16 productos de ejemplo en diferentes categorías
2. Todos los productos están marcados como disponibles (available = true)
3. Las imágenes se pueden agregar después desde la interfaz
4. Los precios son realistas para productos universitarios
5. Las ubicaciones corresponden a lugares comunes en campus

CATEGORÍAS:
- Libros (4 productos)
- Electrónicos (4 productos)
- Ropa (2 productos)
- Apuntes (3 productos)
- Otros (3 productos)

Para agregar imágenes a estos productos:
1. Ve a la página de detalles del producto
2. Haz clic en "Editar" (cuando esté implementado)
3. Sube una imagen
*/
