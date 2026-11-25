-- Nova categoria opcional: DLCs.
-- Como toda categoria, só entra na média se receber nota (sem nota = não se aplica).

INSERT INTO categoria (nome, descricao, peso, ordem) VALUES
  ('DLCs',
   'Vale a pena jogar as DLCs? Conteúdo, qualidade e custo-benefício. Deixe sem nota se o jogo não tiver DLC.',
   0.50,
   8)
ON CONFLICT (nome) DO NOTHING;
