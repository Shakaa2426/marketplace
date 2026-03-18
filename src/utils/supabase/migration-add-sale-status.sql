-- ============================================================================
-- MIGRACIÓN: Agregar columna sale_status a la tabla products
-- Ejecuta este SQL en tu panel de Supabase SQL Editor
-- https://supabase.com/dashboard/project/nszyvlzrmsveajiuqukt/sql
-- ============================================================================

-- Agregar la columna sale_status si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'sale_status'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN sale_status TEXT DEFAULT 'disponible' 
    CHECK (sale_status IN ('disponible', 'en_proceso', 'vendido'));
  END IF;
END $$;

-- Crear índice para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS products_sale_status_idx ON products(sale_status);

-- Actualizar productos existentes que no tengan sale_status
UPDATE products 
SET sale_status = 'disponible' 
WHERE sale_status IS NULL;

-- Verificar que la columna se creó correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'sale_status';
