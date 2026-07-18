-- =========================================
-- seed.sql — Dados iniciais do PDV
-- Executar UMA VEZ na implantação em produção
-- ou sempre que o cliente pedir ajustes no cardápio
-- =========================================

-- Usuários (pin deve ser substituído pelo hash BCrypt gerado pelo sistema)
-- Gerar hash: use AuthService.hashPin("1234") e cole aqui antes de rodar
INSERT INTO usuario (nome, pin, role) VALUES
  ('Administrador', '$2a$12$SUBSTITUA_PELO_HASH_BCRYPT', 'ADMIN'),
  ('João Garçom',   '$2a$12$SUBSTITUA_PELO_HASH_BCRYPT', 'GARCOM')
ON CONFLICT DO NOTHING;

-- Mesas
INSERT INTO mesa (numero, status) VALUES
  (1, 'LIVRE'),
  (2, 'LIVRE'),
  (3, 'LIVRE'),
  (4, 'LIVRE'),
  (5, 'LIVRE')
ON CONFLICT DO NOTHING;

-- Produtos — cardápio inicial (ajustar conforme o cliente)
INSERT INTO produto (nome, preco, categoria, ativo) VALUES
  ('Chopp 300ml',      9.90,  'BEBIDA', true),
  ('Chopp 500ml',      14.90, 'BEBIDA', true),
  ('Cerveja Long Neck',12.00, 'BEBIDA', true),
  ('Água Mineral',     5.00,  'BEBIDA', true),
  ('Refrigerante Lata',7.00,  'BEBIDA', true),
  ('Porcão de Fritas', 22.00, 'COMIDA', true),
  ('Bolinho de Bacalhau (6un)', 28.00, 'COMIDA', true),
  ('Carne Assada (300g)',       45.00, 'COMIDA', true)
ON CONFLICT DO NOTHING;
