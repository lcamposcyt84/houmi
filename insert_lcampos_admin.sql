-- Eliminar si ya existe un usuario con ese email/usuario para evitar duplicados
DELETE FROM Admin WHERE email = 'lcampos';

-- Insertar el nuevo administrador
INSERT INTO Admin (id, email, password, name, role, isActive, createdAt, updatedAt)
VALUES (
  CONCAT('cuid_', REPLACE(UUID(), '-', '')), 
  'lcampos',
  '$2y$10$IXsr6R7vWB85x29pETroouz71GlvNhhdbAL5OCzCbjFmRE120Sfa2', -- Hash bcrypt para '123456789'
  'L Campos',
  'admin',
  1,
  NOW(),
  NOW()
);
