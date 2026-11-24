# Catalog import report

- Result: **imported**
- Imported at: 2026-11-22T03:26:32.726Z
- Workbook: workbook.xlsx (sha256 `fbe386b8db92…`)
- Rows read from Geral: 41
- Entries: 41 (24 initiatives, 17 studies)
- Person names included: yes
- Errors: 0 · Warnings: 36

## Warnings

### `values.unconfirmed-mixed` — 8

"Não confirmado" written next to real values; the real values were kept.

| Rule | ID | Column | Value | Message |
| --- | --- | --- | --- | --- |
| `values.unconfirmed-mixed` | 36 | Setor da Baía de Guanabara (lista) | — | "Não confirmado" next to Transição, Interior. |
| `values.unconfirmed-mixed` | 20 | Setor da Baía de Guanabara (lista) | — | "Não confirmado" next to Entrada, Interior, Fora da Baía. |
| `values.unconfirmed-mixed` | 32 | Setor da Baía de Guanabara (lista) | — | "Não confirmado" next to Entrada, Interior. |
| `values.unconfirmed-mixed` | 27 | Setor da Baía de Guanabara (lista) | — | "Não confirmado" next to Entrada, Interior. |
| `values.unconfirmed-mixed` | 46 | Setor da Baía de Guanabara (lista) | — | "Não confirmado" next to Interior. |
| `values.unconfirmed-mixed` | 10 | Setor da Baía de Guanabara (lista) | — | "Não confirmado" next to Entrada. |
| `values.unconfirmed-mixed` | 40 | Setor da Baía de Guanabara (lista) | — | "Não confirmado" next to Interior. |
| `values.unconfirmed-mixed` | 26 | Setor da Baía de Guanabara (lista) | — | "Não confirmado" next to Interior. |

### `periodicity.multiple` — 1

More than one periodicity; Core v2.0 expects one.

| Rule | ID | Column | Value | Message |
| --- | --- | --- | --- | --- |
| `periodicity.multiple` | 1 | Periodicidade (lista) | — | ID 1 has Contínua, Pontual. |

### `sources.unpaired-metadata` — 13

Several links but one set of source type, venue and year; they could not be paired per link.

| Rule | ID | Column | Value | Message |
| --- | --- | --- | --- | --- |
| `sources.unpaired-metadata` | 1 | DOI ou link | — | ID 1 has 6 links and one set of source facts. |
| `sources.unpaired-metadata` | 17 | DOI ou link | — | ID 17 has 2 links and one set of source facts. |
| `sources.unpaired-metadata` | 35 | DOI ou link | — | ID 35 has 2 links and one set of source facts. |
| `sources.unpaired-metadata` | 18 | DOI ou link | — | ID 18 has 2 links and one set of source facts. |
| `sources.unpaired-metadata` | 25 | DOI ou link | — | ID 25 has 2 links and one set of source facts. |
| `sources.unpaired-metadata` | 43 | DOI ou link | — | ID 43 has 2 links and one set of source facts. |
| `sources.unpaired-metadata` | 7 | DOI ou link | — | ID 7 has 2 links and one set of source facts. |
| `sources.unpaired-metadata` | 46 | DOI ou link | — | ID 46 has 2 links and one set of source facts. |
| `sources.unpaired-metadata` | 45 | DOI ou link | — | ID 45 has 2 links and one set of source facts. |
| `sources.unpaired-metadata` | 48 | DOI ou link | — | ID 48 has 2 links and one set of source facts. |
| `sources.unpaired-metadata` | 12 | DOI ou link | — | ID 12 has 2 links and one set of source facts. |
| `sources.unpaired-metadata` | 41 | DOI ou link | — | ID 41 has 4 links and one set of source facts. |
| `sources.unpaired-metadata` | 40 | DOI ou link | — | ID 40 has 2 links and one set of source facts. |

### `kind.inconsistent` — 1

The inferred kind disagrees with other columns of the row.

| Rule | ID | Column | Value | Message |
| --- | --- | --- | --- | --- |
| `kind.inconsistent` | 35 | — | — | ID 35 was read as a study but lists executors, partners or a coordinator. |

### `parties.authors-on-project` — 1

Authors filled on an initiative; authors belong to studies, so they were not imported.

| Rule | ID | Column | Value | Message |
| --- | --- | --- | --- | --- |
| `parties.authors-on-project` | 25 | Autores (estudos) | — | ID 25 is an initiative with authors "Ferreira, J. A.; Silva, C. A.; Resende, A. T.". |

### `date.annotation` — 2

Date carries a comment in parentheses; the comment was dropped.

| Rule | ID | Column | Value | Message |
| --- | --- | --- | --- | --- |
| `date.annotation` | 41 | Data de início | 2008-04 (período simulado) | Comment "período simulado" dropped from the date. |
| `date.annotation` | 41 | Data de fim | 2008-04 (período simulado) | Comment "período simulado" dropped from the date. |

### `parties.unknown-authors` — 1

Authors written as a placeholder ("Autoria múltipla"); no author was imported.

| Rule | ID | Column | Value | Message |
| --- | --- | --- | --- | --- |
| `parties.unknown-authors` | 51 | Autores (estudos) | Autoria múltipla | ID 51 lists "Autoria múltipla" as authors. |

### `kind.inferred` — 1

The workbook has no column saying initiative or study; the kind was inferred.

| Rule | ID | Column | Value | Message |
| --- | --- | --- | --- | --- |
| `kind.inferred` | — | Mecanismo de atuação (lista) | — | Kind inferred: "Mecanismo de atuação" = "não se aplica" → study; anything else → initiative. |

### `indicators.no-results-tab` — 1

Figures stay in prose: there is no structured results tab yet (D-045).

| Rule | ID | Column | Value | Message |
| --- | --- | --- | --- | --- |
| `indicators.no-results-tab` | — | Resultados gerados | — | "Resultados gerados" is published as prose; totals and charts of results need the results tab. |

### `parties.collective-label` — 6

Actor looks like a collective label rather than an identifiable organization (D-029).

| Rule | ID | Column | Value | Message |
| --- | --- | --- | --- | --- |
| `parties.collective-label` | — | — | Colônias de pescadores | "Colônias de pescadores" may be a collective label, not one organization. |
| `parties.collective-label` | — | — | Pescadores artesanais | "Pescadores artesanais" may be a collective label, not one organization. |
| `parties.collective-label` | — | — | Escoteiros | "Escoteiros" may be a collective label, not one organization. |
| `parties.collective-label` | — | — | Cooperativas de catadores | "Cooperativas de catadores" may be a collective label, not one organization. |
| `parties.collective-label` | — | — | Poder público | "Poder público" may be a collective label, not one organization. |
| `parties.collective-label` | — | — | Comunidade local | "Comunidade local" may be a collective label, not one organization. |

### `parties.institution-type-unknown` — 1

Institution type could not be paired with one institution.

| Rule | ID | Column | Value | Message |
| --- | --- | --- | --- | --- |
| `parties.institution-type-unknown` | — | Tipo de instituição (lista) | CNPq, FAPERJ, CAPES, Instituto BVRio, Ocyan, Colônias de pescadores, Pescadores artesanais, COOP PROMAR, … | 50 institutions have no type: "Tipo de instituição" is written per row, not per institution. |

## Placeholders skipped as absences (D-032)

| Column | Placeholder | Cells |
| --- | --- | --- |
| Mecanismo de atuação (lista) | não se aplica | 17 |
| Executores (lista) | não se aplica | 17 |
| Parceiras (lista) | não se aplica | 17 |
| Parceiras (lista) | não encontrado | 14 |
| Coordenador Geral | não se aplica | 15 |
| Coordenador Geral | não encontrado | 15 |
| Status (lista) | não se aplica | 17 |
| Status (lista) | Não confirmado | 12 |
| Setor da Baía de Guanabara (lista) | Não confirmado | 17 |
| Setor da Baía de Guanabara (lista) | não encontrado | 2 |
| Setor da Baía de Guanabara (lista) | não se aplica | 2 |
| Rios (lista) | sem informação | 33 |
| Colônia de pesca (lista) | sem informação | 39 |
| Unidade de conservação (lista) | sem informação | 37 |
| Autores (estudos) | não se aplica | 23 |
| Autores (estudos) | Autoria múltipla | 1 |
| Veículo ou periódico (string) | não se aplica | 12 |
| Veículo ou periódico (string) | não encontrado | 1 |
| Instituições Executoras (lista) | não se aplica | 7 |
| Instituições Executoras (lista) | não encontrado | 1 |
| Bairro ou localidade (lista) | sem informação | 18 |
| Dados disponíveis | não encontrado | 12 |
| Tipo de local (lista) | sem informação | 13 |
| Financiadoras (lista) | não encontrado | 20 |
| Financiadoras (lista) | não se aplica | 1 |
| Financiadoras (lista) | Não confirmado | 2 |
| Tipo de financiador (lista) | não encontrado | 20 |
| Tipo de financiador (lista) | não se aplica | 1 |
| Tipo de financiador (lista) | Não confirmado | 2 |
| Variável quantitativa e unidade (lista) | Unidade não confirmada | 4 |
| Variável quantitativa e unidade (lista) | Sem dado quantitativo | 12 |
| Data de fim | não encontrado | 13 |
| Data de fim | não se aplica | 4 |
| Ano de publicação | não encontrado | 6 |
| Periodicidade (lista) | não se aplica | 5 |
| Periodicidade (lista) | não encontrado | 3 |
| Data de início | não se aplica | 4 |
| Data de início | não encontrado | 8 |
| Município (lista) | Não confirmado | 8 |
| Resultados gerados | não encontrado | 1 |

