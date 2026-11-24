import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, of } from 'rxjs';

import { JogoExterno } from '../../../core/models/externo.model';
import { ImagemJogo, JogoDetalhe, SalvarJogo, StatusJogo } from '../../../core/models/jogo.model';
import { Categoria } from '../../../core/models/lookups.model';
import { JogosService } from '../../../core/services/jogos.service';
import { LookupsService } from '../../../core/services/lookups.service';
import { STATUS, STATUS_SO_JOGO, infoStatus } from '../../../core/util/status';
import { ChipSelectComponent, OpcaoChip } from '../../../shared/components/chip-select/chip-select.component';
import { ScoreRingComponent } from '../../../shared/components/score-ring/score-ring.component';
import { TagInputComponent } from '../../../shared/components/tag-input/tag-input.component';
import { ImgUrlPipe } from '../../../shared/pipes/img-url.pipe';
import { BuscaExternaComponent } from './busca-externa.component';
import { ImagensEditorComponent } from './imagens-editor.component';

const BARRA_SIMPLES: AngularEditorConfig['toolbarHiddenButtons'] = [
  ['undo', 'redo', 'strikeThrough', 'subscript', 'superscript', 'justifyLeft', 'justifyCenter',
   'justifyRight', 'justifyFull', 'indent', 'outdent', 'heading', 'fontName'],
  ['fontSize', 'textColor', 'backgroundColor', 'insertImage', 'insertVideo', 'insertHorizontalRule',
   'removeFormat', 'toggleEditorMode'],
];

const configEditor = (placeholder: string, altura: string): AngularEditorConfig => ({
  editable: true,
  spellcheck: true,
  minHeight: altura,
  placeholder,
  translate: 'no',
  defaultParagraphSeparator: 'p',
  sanitize: true,
  toolbarHiddenButtons: BARRA_SIMPLES,
  customClasses: [{ name: 'Citação', class: 'quote', tag: 'blockquote' }],
});

const NOTA_INICIAL = 70;

type NotaForm = FormGroup<{ nota: FormControl<number | null>; texto: FormControl<string | null> }>;

@Component({
  selector: 'app-editor-jogo',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, DecimalPipe, AngularEditorModule,
    ChipSelectComponent, TagInputComponent, ScoreRingComponent, ImgUrlPipe,
    BuscaExternaComponent, ImagensEditorComponent,
  ],
  templateUrl: './editor-jogo.component.html',
  styleUrl: './editor-jogo.component.scss',
})
export class EditorJogoComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private destroyRef = inject(DestroyRef);
  private jogosService = inject(JogosService);
  protected lookups = inject(LookupsService);

  readonly editorNota = configEditor('Por que essa nota? (opcional)', '6rem');
  readonly editorResumo = configEditor('Resumo da sua opinião sobre o jogo…', '10rem');

  readonly secoes = [
    { id: 'jogo', titulo: 'Jogo' },
    { id: 'imagens', titulo: 'Imagens' },
    { id: 'experiencia', titulo: 'Minha experiência' },
    { id: 'notas', titulo: 'Notas' },
    { id: 'veredito', titulo: 'Veredito' },
  ];
  readonly estrelas = [1, 2, 3, 4, 5];

  // ---------- estado ----------
  id = signal<number | null>(null);
  slug = signal<string | null>(null);
  carregando = signal(true);
  salvando = signal(false);
  categorias = signal<Categoria[]>([]);
  imagens = signal<ImagemJogo[]>([]);
  notaManualAtiva = signal(false);

  // ---------- formulário ----------
  form = this.fb.group({
    jogo: this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(200)]],
      descricao: [''],
      dtLancamento: [''],
      desenvolvedora: [''],
      publisher: [''],
      faixaEtariaId: [null as number | null],
      igdbId: [null as number | null],
      rawgId: [null as number | null],
      generoIds: [[] as number[]],
      plataformaIds: [[] as number[]],
    }),
    review: this.fb.group({
      status: ['zerado' as StatusJogo],
      plataformaId: [null as number | null],
      horasJogadas: [null as number | null, [Validators.min(0)]],
      dificuldade: [''],
      dtInicio: [''],
      dtConclusao: [''],
      prioridade: [null as number | null],
      resumo: [''],
      pros: [[] as string[]],
      contras: [[] as string[]],
      notaManual: [null as number | null, [Validators.min(0), Validators.max(100)]],
      publicada: [false],
    }),
    notas: this.fb.array<NotaForm>([]),
  });

  get notasArray(): FormArray<NotaForm> {
    return this.form.controls.notas;
  }

  private valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  // ---------- derivados ----------
  opcoesStatus = STATUS.map<OpcaoChip>((s) => ({ valor: s.valor, rotulo: s.rotulo, icone: s.icone }));
  opcoesGenero = computed<OpcaoChip[]>(() =>
    (this.lookups.lookups()?.generos ?? []).map((g) => ({ valor: g.id, rotulo: g.nome })),
  );
  opcoesPlataforma = computed<OpcaoChip[]>(() =>
    (this.lookups.lookups()?.plataformas ?? []).map((p) => ({ valor: p.id, rotulo: p.nome })),
  );
  opcoesFaixaEtaria = computed<OpcaoChip[]>(() =>
    (this.lookups.lookups()?.faixasEtarias ?? []).map((f) => ({ valor: f.id, rotulo: f.nome })),
  );

  status = computed(() => (this.valores().review?.status ?? 'zerado') as StatusJogo);
  pendente = computed(() => infoStatus(this.status()).pendente);
  /** "Quero jogar" e "Backlog" = ainda não jogou: só dados do jogo + capa, sem notas/experiência/veredito */
  somenteJogo = computed(() => STATUS_SO_JOGO.includes(this.status()));
  secoesVisiveis = computed(() =>
    this.somenteJogo() ? this.secoes.filter((s) => s.id === 'jogo' || s.id === 'imagens') : this.secoes,
  );

  notasValores = computed(() =>
    (this.valores().notas ?? []).map((n, i) => ({
      categoriaId: this.categorias()[i]?.id ?? 0,
      nota: (n?.nota ?? null) as number | null,
    })),
  );
  notaCalculada = computed(() => this.lookups.mediaPonderada(this.notasValores()));
  notaFinal = computed(() => {
    const manual = this.valores().review?.notaManual;
    return this.notaManualAtiva() && manual != null ? manual : this.notaCalculada();
  });
  avaliadas = computed(() => this.notasValores().filter((n) => n.nota != null).length);
  pesoTotal = computed(() => this.categorias().reduce((s, c) => s + c.peso, 0));

  nomeJogo = computed(() => this.valores().jogo?.nome?.trim() || 'Novo jogo');
  capaUrl = computed(() => this.imagens().find((i) => i.tipo === 'capa')?.url ?? null);

  progresso = computed<Record<string, boolean>>(() => {
    const v = this.valores();
    return {
      jogo: !!v.jogo?.nome?.trim(),
      imagens: this.imagens().some((i) => i.tipo === 'capa'),
      experiencia: !!v.review?.status,
      notas: this.categorias().length > 0 && this.avaliadas() === this.categorias().length,
      veredito: !!v.review?.resumo?.trim(),
    };
  });

  podePublicar = computed(() => this.notaFinal() != null);

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const statusInicial = this.route.snapshot.queryParamMap.get('status') as StatusJogo | null;
    if (statusInicial && STATUS.some((s) => s.valor === statusInicial)) {
      this.form.controls.review.controls.status.setValue(statusInicial);
    }

    combineLatest([this.lookups.lookups$, idParam ? this.jogosService.obter(idParam) : of(null)])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([lk, jogo]) => {
          this.categorias.set(lk.categorias);
          this.montarNotas(lk.categorias, jogo);
          if (jogo) this.preencher(jogo);
          this.carregando.set(false);
          this.rolarParaFragmento();
        },
        error: () => this.router.navigate(['/admin']),
      });
  }

  // ---------- montagem ----------
  private grupoNota(nota: number | null = null, texto = ''): NotaForm {
    return new FormGroup({
      nota: new FormControl<number | null>(nota),
      texto: new FormControl<string | null>(texto),
    });
  }

  private montarNotas(categorias: Categoria[], jogo: JogoDetalhe | null) {
    const existentes = new Map((jogo?.notas ?? []).map((n) => [n.categoriaId, n]));
    this.notasArray.clear();
    for (const c of categorias) {
      const n = existentes.get(c.id);
      this.notasArray.push(this.grupoNota(n?.nota ?? null, n?.texto ?? ''));
    }
  }

  private preencher(j: JogoDetalhe) {
    this.id.set(j.id);
    this.slug.set(j.slug);
    this.imagens.set(j.imagens.map(({ url, tipo }) => ({ url, tipo })));
    this.notaManualAtiva.set(j.review.notaManual != null);

    this.form.patchValue({
      jogo: {
        nome: j.nome,
        descricao: j.descricao ?? '',
        dtLancamento: j.dtLancamento ?? '',
        desenvolvedora: j.desenvolvedora ?? '',
        publisher: j.publisher ?? '',
        faixaEtariaId: j.faixaEtaria?.id ?? null,
        igdbId: j.igdbId,
        rawgId: j.rawgId,
        generoIds: j.generos.map((g) => g.id),
        plataformaIds: j.plataformas.map((p) => p.id),
      },
      review: {
        status: j.review.status,
        plataformaId: j.review.plataforma?.id ?? null,
        horasJogadas: j.review.horasJogadas,
        dificuldade: j.review.dificuldade ?? '',
        dtInicio: j.review.dtInicio ?? '',
        dtConclusao: j.review.dtConclusao ?? '',
        prioridade: j.review.prioridade,
        resumo: j.review.resumo ?? '',
        pros: j.review.pros,
        contras: j.review.contras,
        notaManual: j.review.notaManual,
        publicada: j.review.publicada,
      },
    });
  }

  private rolarParaFragmento() {
    const frag = this.route.snapshot.fragment;
    if (frag) setTimeout(() => this.irPara(frag), 50);
  }

  // ---------- ações ----------
  irPara(secao: string) {
    document.getElementById(secao)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  definirNota(i: number, valor: number | null) {
    this.notasArray.at(i).get('nota')!.setValue(valor);
  }

  corNota(nota: number | null | undefined): string {
    return this.lookups.faixa(nota)?.cor ?? 'var(--text-muted)';
  }

  rotuloNota(nota: number | null | undefined): string {
    return this.lookups.faixa(nota)?.rotulo ?? '';
  }

  alternarNotaManual() {
    const ativa = !this.notaManualAtiva();
    this.notaManualAtiva.set(ativa);
    const ctrl = this.form.controls.review.controls.notaManual;
    ctrl.setValue(ativa ? (this.notaCalculada() ?? NOTA_INICIAL) : null);
  }

  definirPrioridade(p: number) {
    const ctrl = this.form.controls.review.controls.prioridade;
    ctrl.setValue(ctrl.value === p ? null : p);
  }

  aplicarImportacao(d: JogoExterno) {
    const jogo = this.form.controls.jogo;
    const atual = jogo.getRawValue();

    jogo.patchValue({
      nome: d.nome,
      descricao: d.descricao ?? atual.descricao,
      dtLancamento: d.dtLancamento ?? atual.dtLancamento,
      desenvolvedora: d.desenvolvedora ?? atual.desenvolvedora,
      publisher: d.publisher ?? atual.publisher,
      faixaEtariaId: d.faixaEtariaId ?? atual.faixaEtariaId,
      generoIds: d.generoIds.length ? d.generoIds : atual.generoIds,
      plataformaIds: d.plataformaIds.length ? d.plataformaIds : atual.plataformaIds,
      igdbId: d.fonte === 'igdb' ? d.idExterno : atual.igdbId,
      rawgId: d.fonte === 'rawg' ? d.idExterno : atual.rawgId,
    });

    // se o jogo só saiu em uma plataforma, já marca como a plataforma jogada
    const review = this.form.controls.review.controls;
    if (!review.plataformaId.value && d.plataformaIds.length === 1) {
      review.plataformaId.setValue(d.plataformaIds[0]);
    }

    // imagens: substitui capa/banner e screenshots externos; mantém uploads locais
    this.imagens.update((lista) => {
      const locais = lista.filter((i) => i.url.startsWith('/uploads/'));
      const novas: ImagemJogo[] = [...locais];
      if (d.capaUrl && !locais.some((i) => i.tipo === 'capa')) novas.push({ url: d.capaUrl, tipo: 'capa' });
      if (d.bannerUrl && !locais.some((i) => i.tipo === 'banner')) novas.push({ url: d.bannerUrl, tipo: 'banner' });
      d.screenshots.forEach((url) => novas.push({ url, tipo: 'screenshot' }));
      // mantém externos antigos se a importação não trouxe substitutos
      for (const antigo of lista) {
        if (antigo.url.startsWith('/uploads/')) continue;
        if (antigo.tipo !== 'screenshot' && !novas.some((n) => n.tipo === antigo.tipo)) novas.push(antigo);
      }
      return novas;
    });

    this.toastr.success(`Dados de "${d.nome}" importados do ${d.fonte.toUpperCase()}`);
    const faltando = [...d.naoMapeados.generos, ...d.naoMapeados.plataformas];
    if (faltando.length) {
      this.toastr.info(`Não cadastrados aqui (ignorados): ${faltando.join(', ')}`, 'Atenção', { timeOut: 7000 });
    }
  }

  salvar(publicar?: boolean) {
    if (publicar !== undefined) this.form.controls.review.controls.publicada.setValue(publicar);

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toastr.warning('Confira os campos destacados.');
      this.irPara('jogo');
      return;
    }

    const v = this.form.getRawValue();
    const vazio = (s: string | null | undefined) => (s?.trim() ? s.trim() : null);
    const textoRico = (s: string | null | undefined) => {
      const limpo = (s ?? '').replace(/<[^>]*>|&nbsp;/g, '').trim();
      return limpo ? s! : null;
    };

    const dados: SalvarJogo = {
      jogo: {
        nome: v.jogo.nome!.trim(),
        descricao: vazio(v.jogo.descricao),
        dtLancamento: vazio(v.jogo.dtLancamento),
        desenvolvedora: vazio(v.jogo.desenvolvedora),
        publisher: vazio(v.jogo.publisher),
        faixaEtariaId: v.jogo.faixaEtariaId,
        igdbId: v.jogo.igdbId,
        rawgId: v.jogo.rawgId,
        generoIds: v.jogo.generoIds ?? [],
        plataformaIds: v.jogo.plataformaIds ?? [],
      },
      review: {
        status: v.review.status!,
        plataformaId: v.review.plataformaId,
        horasJogadas: v.review.horasJogadas,
        dificuldade: vazio(v.review.dificuldade),
        dtInicio: vazio(v.review.dtInicio),
        dtConclusao: vazio(v.review.dtConclusao),
        prioridade: v.review.prioridade,
        resumo: textoRico(v.review.resumo),
        pros: v.review.pros ?? [],
        contras: v.review.contras ?? [],
        notaManual: this.notaManualAtiva() ? v.review.notaManual : null,
        publicada: !!v.review.publicada,
      },
      notas: this.categorias().map((c, i) => ({
        categoriaId: c.id,
        nota: v.notas[i]?.nota ?? null,
        texto: textoRico(v.notas[i]?.texto),
      })),
      imagens: this.imagens().map(({ url, tipo }) => ({ url, tipo })),
    };

    if (this.somenteJogo()) {
      // lista de desejos: descarta tudo que pressupõe ter jogado
      const tinhaDados =
        this.avaliadas() > 0 || !!dados.review.resumo || dados.imagens.some((i) => i.tipo !== 'capa');
      const rotulo = infoStatus(this.status()).rotulo;
      if (tinhaDados && !window.confirm(`Em "${rotulo}" notas, veredito, banner e screenshots são descartados. Continuar?`)) {
        return;
      }
      dados.notas = [];
      dados.imagens = dados.imagens.filter((i) => i.tipo === 'capa');
      dados.review = {
        ...dados.review,
        plataformaId: null,
        horasJogadas: null,
        dificuldade: null,
        dtInicio: null,
        dtConclusao: null,
        resumo: null,
        pros: [],
        contras: [],
        notaManual: null,
        publicada: false,
      };
    }

    this.salvando.set(true);
    const id = this.id();
    const req = id ? this.jogosService.atualizar(id, dados) : this.jogosService.criar(dados);

    req.subscribe({
      next: (r) => {
        this.salvando.set(false);
        this.toastr.success(
          dados.review.publicada
            ? 'Review publicada!'
            : this.somenteJogo()
              ? `Salvo em "${infoStatus(this.status()).rotulo}"`
              : 'Salvo como rascunho',
        );
        if (dados.review.publicada) this.router.navigate(['/jogo', r.slug]);
        else if (this.pendente()) this.router.navigate(['/backlog']);
        else if (!id) this.router.navigate(['/admin/jogos', r.id, 'editar'], { replaceUrl: true });
        else this.slug.set(r.slug);
      },
      error: () => this.salvando.set(false),
    });
  }
}
