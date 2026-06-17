-- Crear/actualizar admin
DELETE FROM admin WHERE email = 'admin@houmi.com';

INSERT INTO admin (id, email, password, name, role)
VALUES (
  CONCAT('adm_', REPLACE(UUID(), '-', '')), 
  'admin@houmi.com',
  '$2y$12$VfkGdfnoLYiDyKmwjNLyOOiys4gOa5TrNd6.OI.rJ.8VM7bPlH3xO',
  'Administrator',
  'superadmin'
);
