-- public.tb_categorianota definição

-- Drop table

-- DROP TABLE public.tb_categorianota;

CREATE TABLE public.tb_categorianota (
	id_categorianota numeric(18) NOT NULL,
	tx_descricao text NOT NULL,
	CONSTRAINT categoria_pk PRIMARY KEY (id_categorianota)
);

-- public.tb_faixaetaria definição

-- Drop table

-- DROP TABLE public.tb_faixaetaria;

CREATE TABLE public.tb_faixaetaria (
	id_faixaetaria numeric(18) NOT NULL,
	tx_descricao text NOT NULL,
	CONSTRAINT faixaetaria_pk PRIMARY KEY (id_faixaetaria)
);

-- public.tb_genero definição

-- Drop table

-- DROP TABLE public.tb_genero;

CREATE TABLE public.tb_genero (
	id_genero numeric(18) NOT NULL,
	tx_descricao text NOT NULL,
	CONSTRAINT genero_pk PRIMARY KEY (id_genero)
);

-- public.tb_imagemjogotipo definição

-- Drop table

-- DROP TABLE public.tb_imagemjogotipo;

CREATE TABLE public.tb_imagemjogotipo (
	id_imagemjogotipo numeric(18) NOT NULL,
	tx_descricao text NOT NULL,
	CONSTRAINT imagemjogotipo_pk PRIMARY KEY (id_imagemjogotipo)
);

-- public.tb_plataforma definição

-- Drop table

-- DROP TABLE public.tb_plataforma;

CREATE TABLE public.tb_plataforma (
	id_plataforma numeric(18) NOT NULL,
	tx_descricao text NOT NULL,
	CONSTRAINT plataforma_pk PRIMARY KEY (id_plataforma)
);

-- public.tb_jogo definição

-- Drop table

-- DROP TABLE public.tb_jogo;

CREATE TABLE public.tb_jogo (
	id_jogo numeric(18) DEFAULT nextval('jogo_seq'::regclass) NOT NULL,
	tx_nome text NOT NULL,
	dt_lancamento timestamp NOT NULL,
	tx_publisher text NOT NULL,
	tx_desenvolvedora text NOT NULL,
	cd_plataformajogada numeric(18) NOT NULL,
	cd_faixaetaria numeric(18) NOT NULL,
     --nr_preco numeric(18,4) NOT NULL, //TODO: colocar preço, com algum link afiliado por exemplo
	CONSTRAINT tb_jogo_pkey PRIMARY KEY (id_jogo),
	CONSTRAINT jogo_faixaetaria_fk FOREIGN KEY (cd_faixaetaria) REFERENCES public.tb_faixaetaria(id_faixaetaria),
	CONSTRAINT jogo_plataformajogada_fk FOREIGN KEY (cd_plataformajogada) REFERENCES public.tb_plataforma(id_plataforma)
);

-- public.tb_jogoplataforma definição

-- Drop table

-- DROP TABLE public.tb_jogoplataforma;

CREATE TABLE public.tb_jogoplataforma (
	id_jogoplataforma numeric(18) DEFAULT nextval('jogoplataforma_seq'::regclass) NOT NULL,
	cd_jogo numeric(18) NOT NULL,
	cd_plataforma numeric(18) NOT NULL,
	CONSTRAINT tb_jogoplataforma_pkey PRIMARY KEY (id_jogoplataforma),
	CONSTRAINT jogoplataforma_jogo_fk FOREIGN KEY (cd_jogo) REFERENCES public.tb_jogo(id_jogo),
	CONSTRAINT jogoplataforma_plataforma_fk FOREIGN KEY (cd_plataforma) REFERENCES public.tb_plataforma(id_plataforma)
);

-- public.tb_notasjogo definição

-- Drop table

-- DROP TABLE public.tb_notasjogo;

CREATE TABLE public.tb_notasjogo (
	id_notasjogo numeric(18) DEFAULT nextval('notasjogo_seq'::regclass) NOT NULL,
	tx_descricao text NOT NULL,
	cd_categorianota numeric(18) NOT NULL,
	cd_jogo numeric(18) NOT NULL,
	nr_nota numeric(18) NOT NULL,
	CONSTRAINT tb_notasjogo_pkey PRIMARY KEY (id_notasjogo),
	CONSTRAINT notasjogo_categoria_fk FOREIGN KEY (cd_categorianota) REFERENCES public.tb_categorianota(id_categorianota),
	CONSTRAINT notasjogo_jogo_fk FOREIGN KEY (cd_jogo) REFERENCES public.tb_jogo(id_jogo)
);

-- public.tb_generojogo definição

-- Drop table

-- DROP TABLE public.tb_generojogo;

CREATE TABLE public.tb_generojogo (
	id_generojogo numeric(18) DEFAULT nextval('generojogo_seq'::regclass) NOT NULL,
	cd_jogo numeric(18) NOT NULL,
	cd_genero numeric(18) NOT NULL,
	CONSTRAINT tb_generojogo_pkey PRIMARY KEY (id_generojogo),
	CONSTRAINT generojogo_genero_fk FOREIGN KEY (cd_genero) REFERENCES public.tb_genero(id_genero),
	CONSTRAINT generojogo_jogo_fk FOREIGN KEY (cd_jogo) REFERENCES public.tb_jogo(id_jogo)
);

-- public.tb_imagemjogo definição

-- Drop table

-- DROP TABLE public.tb_imagemjogo;

CREATE TABLE public.tb_imagemjogo (
	id_imagemjogo numeric(18) DEFAULT nextval('imagemjogo_seq'::regclass) NOT NULL,
	tx_caminhoimagem text NOT NULL,
	cd_jogo numeric(18) NOT NULL,
	fl_capa bool NOT NULL,
	CONSTRAINT tb_imagemjogo_pkey PRIMARY KEY (id_imagemjogo),
	CONSTRAINT imagemjogo_jogo_fk FOREIGN KEY (cd_jogo) REFERENCES public.tb_jogo(id_jogo)
);