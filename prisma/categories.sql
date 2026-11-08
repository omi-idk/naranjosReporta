-- Catálogo de tipos de incidencias; no contiene reportes, estadísticas ni ubicaciones.
-- Ejecutar una vez sobre la base migrada. Repetir no altera categorías existentes.
INSERT INTO "Category" (id, slug, name, active) VALUES
  ('b713b781-345a-4ba0-ade6-042cafb6f101', 'baches', 'Baches', true),
  ('b713b781-345a-4ba0-ade6-042cafb6f102', 'fugas-de-agua', 'Fugas de agua', true),
  ('b713b781-345a-4ba0-ade6-042cafb6f103', 'alumbrado', 'Alumbrado', true),
  ('b713b781-345a-4ba0-ade6-042cafb6f104', 'basura', 'Basura', true),
  ('b713b781-345a-4ba0-ade6-042cafb6f105', 'vialidades', 'Vialidades', true),
  ('b713b781-345a-4ba0-ade6-042cafb6f106', 'espacios-publicos', 'Espacios públicos', true)
ON CONFLICT (slug) DO NOTHING;
