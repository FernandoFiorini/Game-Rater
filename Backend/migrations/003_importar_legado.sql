-- Importa os dados do schema antigo (tb_jogo, tb_notasjogo...) para o novo.
-- Só roda se as tabelas antigas existirem e o novo schema ainda estiver vazio.
-- As tabelas antigas NÃO são apagadas. Depois de conferir os dados, rode
-- manualmente o bloco "LIMPEZA" no fim deste arquivo.

DO $$
BEGIN
  IF to_regclass('public.tb_jogo') IS NULL THEN
    RAISE NOTICE 'Schema legado não encontrado — nada a importar.';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM jogo) THEN
    RAISE NOTICE 'Tabela jogo já possui dados — importação legado ignorada.';
    RETURN;
  END IF;

  -- domínios: casa pelo nome, cria o que não existir
  INSERT INTO plataforma (nome, ordem)
    SELECT DISTINCT trim(tx_descricao), 50 FROM tb_plataforma
  ON CONFLICT (nome) DO NOTHING;

  INSERT INTO genero (nome)
    SELECT DISTINCT trim(tx_descricao) FROM tb_genero
  ON CONFLICT (nome) DO NOTHING;

  INSERT INTO faixa_etaria (nome, ordem)
    SELECT DISTINCT trim(tx_descricao), 50 FROM tb_faixaetaria
  ON CONFLICT (nome) DO NOTHING;

  INSERT INTO categoria (nome, ordem)
    SELECT DISTINCT trim(tx_descricao), 50 FROM tb_categorianota
  ON CONFLICT (nome) DO NOTHING;

  -- jogos (mantém o id antigo)
  INSERT INTO jogo (id, slug, nome, dt_lancamento, desenvolvedora, publisher, faixa_etaria_id)
  OVERRIDING SYSTEM VALUE
  SELECT
    j.id_jogo::bigint,
    CASE
      WHEN fn_slug(j.tx_nome) = '' THEN 'jogo-' || j.id_jogo
      WHEN count(*) OVER (PARTITION BY fn_slug(j.tx_nome)) > 1 THEN fn_slug(j.tx_nome) || '-' || j.id_jogo
      ELSE fn_slug(j.tx_nome)
    END,
    j.tx_nome,
    j.dt_lancamento::date,
    j.tx_desenvolvedora,
    j.tx_publisher,
    fe.id
  FROM tb_jogo j
  LEFT JOIN tb_faixaetaria ofe ON ofe.id_faixaetaria = j.cd_faixaetaria
  LEFT JOIN faixa_etaria fe    ON fe.nome = trim(ofe.tx_descricao);

  PERFORM setval(pg_get_serial_sequence('jogo', 'id'), (SELECT max(id) FROM jogo));

  -- review: tudo que estava cadastrado era jogo já avaliado
  INSERT INTO review (jogo_id, status, plataforma_id, publicada, dt_publicacao)
  SELECT j.id_jogo::bigint, 'zerado', p.id, true, now()
  FROM tb_jogo j
  LEFT JOIN tb_plataforma op ON op.id_plataforma = j.cd_plataformajogada
  LEFT JOIN plataforma p     ON p.nome = trim(op.tx_descricao);

  -- notas: o sistema antigo duplicava notas ao editar; fica a mais recente
  INSERT INTO review_nota (review_id, categoria_id, nota, texto)
  SELECT DISTINCT ON (r.id, c.id)
    r.id, c.id,
    least(greatest(round(n.nr_nota), 0), 100)::smallint,
    n.tx_descricao
  FROM tb_notasjogo n
  JOIN review r            ON r.jogo_id = n.cd_jogo
  JOIN tb_categorianota oc ON oc.id_categorianota = n.cd_categorianota
  JOIN categoria c         ON c.nome = trim(oc.tx_descricao)
  ORDER BY r.id, c.id, n.id_notasjogo DESC;

  INSERT INTO jogo_plataforma (jogo_id, plataforma_id)
  SELECT DISTINCT jp.cd_jogo::bigint, p.id
  FROM tb_jogoplataforma jp
  JOIN tb_plataforma op ON op.id_plataforma = jp.cd_plataforma
  JOIN plataforma p     ON p.nome = trim(op.tx_descricao)
  ON CONFLICT DO NOTHING;

  INSERT INTO jogo_genero (jogo_id, genero_id)
  SELECT DISTINCT gj.cd_jogo::bigint, g.id
  FROM tb_generojogo gj
  JOIN tb_genero og ON og.id_genero = gj.cd_genero
  JOIN genero g     ON g.nome = trim(og.tx_descricao)
  ON CONFLICT DO NOTHING;

  -- imagens: a primeira marcada como capa vira capa; o resto vira screenshot
  INSERT INTO jogo_imagem (jogo_id, url, tipo, ordem)
  SELECT
    i.cd_jogo::bigint,
    i.tx_caminhoimagem,
    CASE WHEN i.fl_capa AND row_number() OVER (PARTITION BY i.cd_jogo, i.fl_capa ORDER BY i.id_imagemjogo) = 1
         THEN 'capa' ELSE 'screenshot' END,
    row_number() OVER (PARTITION BY i.cd_jogo ORDER BY i.id_imagemjogo)
  FROM tb_imagemjogo i;

  RAISE NOTICE 'Importação do schema legado concluída.';
END;
$$;

-- ---------------------------------------------------------------------
-- LIMPEZA (rodar manualmente depois de validar os dados importados):
--
-- DROP TABLE IF EXISTS tb_imagemjogo, tb_generojogo, tb_notasjogo, tb_jogoplataforma,
--   tb_jogo, tb_imagemjogotipo, tb_categorianota, tb_faixaetaria, tb_genero, tb_plataforma;
-- DROP SEQUENCE IF EXISTS jogo_seq, jogoplataforma_seq, notasjogo_seq, generojogo_seq, imagemjogo_seq;
-- ---------------------------------------------------------------------
