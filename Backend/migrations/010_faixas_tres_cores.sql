-- Escala simplificada em 3 cores:
--   0–40  Péssimo  -> vermelho
--  41–65  Mediano  -> laranja
--  66+    Bom, Ótimo, Excelente, Brilhante, Obra-prima -> verde (rótulos mantidos para nuance)

DELETE FROM faixa_nota WHERE rotulo = 'Ruim';

UPDATE faixa_nota SET cor = '#b4232c'                      WHERE rotulo = 'Péssimo';
UPDATE faixa_nota SET nota_minima = 41, cor = '#d9622b'    WHERE rotulo = 'Mediano';
UPDATE faixa_nota SET nota_minima = 66                     WHERE rotulo = 'Bom';
UPDATE faixa_nota SET cor = '#2f9e6e'                      WHERE nota_minima >= 66;
