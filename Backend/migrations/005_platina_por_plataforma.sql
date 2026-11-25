-- Platina por plataforma: posso ter platinado no PS5 e no PS4, ou só em um.

ALTER TABLE review_plataforma ADD COLUMN platinado boolean NOT NULL DEFAULT false;

-- até aqui cada review tinha no máximo 1 plataforma: se está Platinado, foi nela
UPDATE review_plataforma rp
   SET platinado = true
  FROM review r
 WHERE r.id = rp.review_id
   AND r.status = 'platinado';
