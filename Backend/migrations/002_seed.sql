-- Dados iniciais. Idempotente (ON CONFLICT DO NOTHING).

INSERT INTO plataforma (nome, sigla, ordem) VALUES
  ('PC',                'PC',     1),
  ('PlayStation 5',     'PS5',    2),
  ('PlayStation 4',     'PS4',    3),
  ('Xbox Series X|S',   'XSX',    4),
  ('Xbox One',          'XONE',   5),
  ('Nintendo Switch 2', 'NS2',    6),
  ('Nintendo Switch',   'NS',     7),
  ('Steam Deck',        'Deck',   8),
  ('Mobile',            'Mobile', 9),
  ('Retrô / Outros',    'Outros', 99)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO genero (nome) VALUES
  ('Ação'), ('Aventura'), ('RPG'), ('Terror'), ('Tiro'), ('Estratégia'),
  ('Plataforma'), ('Corrida'), ('Esporte'), ('Luta'), ('Puzzle'), ('Simulação'),
  ('Metroidvania'), ('Roguelike'), ('Soulslike'), ('Mundo aberto'), ('Indie'),
  ('Stealth'), ('Sobrevivência'), ('Hack and slash'), ('Narrativo'), ('Arcade')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO faixa_etaria (nome, ordem) VALUES
  ('Livre', 0), ('10 anos', 10), ('12 anos', 12), ('14 anos', 14), ('16 anos', 16), ('18 anos', 18)
ON CONFLICT (nome) DO NOTHING;

-- Pesos: jogabilidade e história pesam mais; troféus pesam pouco.
INSERT INTO categoria (nome, descricao, peso, ordem) VALUES
  ('Jogabilidade',     'Controles, mecânicas, loop de gameplay, level design.',      2.00, 1),
  ('História',         'Roteiro, personagens, ambientação e construção de mundo.',  1.50, 2),
  ('Gráficos',         'Direção de arte, fidelidade visual, desempenho.',            1.00, 3),
  ('Trilha sonora',    'Música, efeitos sonoros, dublagem.',                         1.00, 4),
  ('Dificuldade',      'Balanceamento, curva de aprendizado, justiça dos desafios.', 0.75, 5),
  ('Rejogabilidade',   'Duração, conteúdo extra, vontade de voltar.',                0.75, 6),
  ('Troféus',          'Lista de conquistas: criatividade, grind, platina.',         0.50, 7)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO faixa_nota (nota_minima, rotulo, cor) VALUES
  (0,  'Péssimo',    '#b4232c'),
  (30, 'Ruim',       '#d9622b'),
  (50, 'Mediano',    '#d9a12b'),
  (65, 'Bom',        '#7fae3c'),
  (75, 'Ótimo',      '#2f9e6e'),
  (85, 'Excelente',  '#2b8fd9'),
  (92, 'Brilhante',  '#8b5cf6'),
  (97, 'Obra-prima', '#e0a526')
ON CONFLICT (nota_minima) DO NOTHING;
