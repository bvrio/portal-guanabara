-- Portal Guanabara — proposed MySQL 8 schema (v0.7 draft, for review with BVRio).
--
-- Mirrors the Catalog Domain model (packages/catalog-domain/src/model) that the
-- web app reads today from data/catalog-snapshot.json, plus what retiring the
-- Google Sheet needs: publication status, public suggestions (submissions),
-- an audit trail and translations of the controlled vocabularies.
-- Read API: packages/catalog-domain/openapi.json. Rationale: backend.md.
--
-- Conventions: InnoDB, utf8mb4, snake_case, codes are the slugs the API uses.
-- Migrations would live in the backend (e.g. Flyway V1__catalog.sql) — to confirm.

SET NAMES utf8mb4;

-- ------------------------------------------------------------ vocabularies

-- Controlled lists of the workbook's "Listas" tab, one table for all of them.
CREATE TABLE taxonomy_term (
  list        VARCHAR(32)  NOT NULL COMMENT 'keyword | mechanism | site_type | institution_type | source_type | indicator | sector',
  code        VARCHAR(80)  NOT NULL COMMENT 'Slug used by the API filters, e.g. macrolixo',
  name_pt     VARCHAR(160) NOT NULL,
  category    VARCHAR(80)  NULL     COMMENT 'Keywords only: Tipo de resíduo, Ambiente, Biota…',
  position    SMALLINT     NOT NULL DEFAULT 0,
  retired_at  DATETIME(3)  NULL     COMMENT 'Kept for history; hidden from new entries',
  PRIMARY KEY (list, code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- en, es, fr labels (Portuguese is name_pt). Free text is never translated here.
CREATE TABLE taxonomy_term_translation (
  list    VARCHAR(32)  NOT NULL,
  code    VARCHAR(80)  NOT NULL,
  locale  VARCHAR(5)   NOT NULL,
  name    VARCHAR(160) NOT NULL,
  PRIMARY KEY (list, code, locale),
  CONSTRAINT taxonomy_term_translation_locale CHECK (locale IN ('en', 'es', 'fr')),
  CONSTRAINT taxonomy_term_translation_term FOREIGN KEY (list, code) REFERENCES taxonomy_term (list, code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------- territory

-- Official municipal mesh (IBGE). The map reads the simplified GeoJSON; the
-- full outline stays for spatial queries (e.g. which municipality a point is in).
CREATE TABLE municipality (
  ibge_code            CHAR(7)      NOT NULL,
  slug                 VARCHAR(80)  NOT NULL,
  name                 VARCHAR(120) NOT NULL,
  boundary             MULTIPOLYGON NOT NULL SRID 4326,
  boundary_simplified  JSON         NULL COMMENT 'GeoJSON MultiPolygon coordinates served by GET /catalog/map',
  boundary_source      VARCHAR(200) NOT NULL COMMENT 'e.g. IBGE Malha Municipal 2024',
  PRIMARY KEY (ibge_code),
  UNIQUE KEY municipality_slug (slug),
  SPATIAL INDEX municipality_boundary (boundary)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Every place an entry can name (D-051): bay sectors, municipalities,
-- localities, rivers, conservation units, fishing colonies.
CREATE TABLE place (
  id                      VARCHAR(120) NOT NULL COMMENT '<type>:<slug>, e.g. municipality:niteroi',
  type                    ENUM('sector', 'municipality', 'locality', 'river', 'conservation_unit', 'fishing_colony') NOT NULL,
  slug                    VARCHAR(100) NOT NULL,
  name                    VARCHAR(160) NOT NULL,
  municipality_ibge_code  CHAR(7)      NULL COMMENT 'Set for type = municipality',
  location                POINT        NULL SRID 4326 COMMENT 'Future: geolocated places',
  PRIMARY KEY (id),
  UNIQUE KEY place_type_slug (type, slug),
  CONSTRAINT place_municipality FOREIGN KEY (municipality_ibge_code) REFERENCES municipality (ibge_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------- parties

CREATE TABLE party (
  id                  VARCHAR(160) NOT NULL COMMENT 'institution:<slug> | person:<slug>',
  kind                ENUM('institution', 'person') NOT NULL,
  name                VARCHAR(255) NOT NULL,
  institution_type    VARCHAR(80)  NULL COMMENT 'taxonomy_term(list = institution_type)',
  logo_url            VARCHAR(500) NULL COMMENT 'Only with the institution''s authorisation',
  logo_authorised_at  DATETIME(3)  NULL,
  PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------- entries

CREATE TABLE entry (
  ref                 INT UNSIGNED NOT NULL COMMENT 'Workbook ID; never reused (D-047)',
  kind                ENUM('project', 'study') NOT NULL,
  name                VARCHAR(500) NOT NULL,
  objective           TEXT         NULL,
  status              ENUM('active', 'in_implementation', 'ended', 'published', 'in_progress') NULL,
  start_date          DATE         NULL,
  start_precision     ENUM('day', 'month', 'year') NULL,
  end_date            DATE         NULL,
  end_precision       ENUM('day', 'month', 'year') NULL,
  ongoing             BOOLEAN      NOT NULL DEFAULT FALSE,
  results_summary     TEXT         NULL,
  data_availability   TEXT         NULL,
  detail_notes        TEXT         NULL COMMENT 'One note per line, "Label: text" or plain',
  publication_status  ENUM('draft', 'published', 'retired') NOT NULL DEFAULT 'draft',
  published_at        DATETIME(3)  NULL,
  retired_at          DATETIME(3)  NULL,
  created_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  updated_by          VARCHAR(120) NULL,
  version             INT          NOT NULL DEFAULT 0 COMMENT 'Optimistic locking (JPA @Version)',
  PRIMARY KEY (ref),
  KEY entry_publication (publication_status, kind),
  FULLTEXT KEY entry_text (name, objective)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE entry_periodicity (
  entry_ref    INT UNSIGNED NOT NULL,
  periodicity  ENUM('continuous', 'periodic', 'one_off') NOT NULL,
  PRIMARY KEY (entry_ref, periodicity),
  CONSTRAINT entry_periodicity_entry FOREIGN KEY (entry_ref) REFERENCES entry (ref)
) ENGINE = InnoDB;

-- Keywords, mechanisms, site types and indicators of an entry.
CREATE TABLE entry_term (
  entry_ref  INT UNSIGNED NOT NULL,
  list       VARCHAR(32)  NOT NULL,
  code       VARCHAR(80)  NOT NULL,
  position   SMALLINT     NOT NULL DEFAULT 0,
  PRIMARY KEY (entry_ref, list, code),
  KEY entry_term_by_term (list, code),
  CONSTRAINT entry_term_entry FOREIGN KEY (entry_ref) REFERENCES entry (ref),
  CONSTRAINT entry_term_term FOREIGN KEY (list, code) REFERENCES taxonomy_term (list, code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE entry_place (
  entry_ref  INT UNSIGNED NOT NULL,
  place_id   VARCHAR(120) NOT NULL,
  PRIMARY KEY (entry_ref, place_id),
  KEY entry_place_by_place (place_id),
  CONSTRAINT entry_place_entry FOREIGN KEY (entry_ref) REFERENCES entry (ref),
  CONSTRAINT entry_place_place FOREIGN KEY (place_id) REFERENCES place (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE entry_party (
  entry_ref  INT UNSIGNED NOT NULL,
  party_id   VARCHAR(160) NOT NULL,
  role       ENUM('executor', 'funder', 'partner', 'coordinator', 'author') NOT NULL,
  note       VARCHAR(255) NULL,
  position   SMALLINT     NOT NULL DEFAULT 0,
  PRIMARY KEY (entry_ref, party_id, role),
  KEY entry_party_by_party (party_id),
  CONSTRAINT entry_party_entry FOREIGN KEY (entry_ref) REFERENCES entry (ref),
  CONSTRAINT entry_party_party FOREIGN KEY (party_id) REFERENCES party (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE source (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  url             VARCHAR(1000) NOT NULL,
  doi             VARCHAR(200)  NULL,
  note            VARCHAR(500)  NULL,
  source_type     VARCHAR(80)   NULL COMMENT 'taxonomy_term(list = source_type)',
  venue           VARCHAR(255)  NULL,
  published_year  SMALLINT      NULL,
  PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE entry_source (
  entry_ref  INT UNSIGNED    NOT NULL,
  source_id  BIGINT UNSIGNED NOT NULL,
  position   SMALLINT        NOT NULL DEFAULT 0,
  PRIMARY KEY (entry_ref, source_id),
  CONSTRAINT entry_source_entry FOREIGN KEY (entry_ref) REFERENCES entry (ref),
  CONSTRAINT entry_source_source FOREIGN KEY (source_id) REFERENCES source (id)
) ENGINE = InnoDB;

CREATE TABLE entry_publication_year (
  entry_ref  INT UNSIGNED NOT NULL,
  year       SMALLINT     NOT NULL,
  PRIMARY KEY (entry_ref, year),
  CONSTRAINT entry_publication_year_entry FOREIGN KEY (entry_ref) REFERENCES entry (ref)
) ENGINE = InnoDB;

-- ------------------------------------------------------ editing and review

-- Public suggestions (no login): a new entry or a correction. Nothing is
-- published until an editor approves it. Contact data exists only to follow
-- up and is erased after the retention period (LGPD).
CREATE TABLE submission (
  id                   BINARY(16)   NOT NULL COMMENT 'UUID',
  type                 ENUM('new_entry', 'correction') NOT NULL,
  entry_ref            INT UNSIGNED NULL COMMENT 'type = correction',
  payload              JSON         NOT NULL COMMENT 'Proposed fields, untrusted until reviewed',
  message              TEXT         NULL,
  contact_name         VARCHAR(120) NULL,
  contact_email        VARCHAR(254) NULL,
  contact_institution  VARCHAR(200) NULL,
  consent_at           DATETIME(3)  NOT NULL,
  contact_erased_at    DATETIME(3)  NULL,
  status               ENUM('received', 'in_review', 'approved', 'rejected') NOT NULL DEFAULT 'received',
  received_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  reviewed_at          DATETIME(3)  NULL,
  reviewed_by          VARCHAR(120) NULL,
  review_note          TEXT         NULL,
  PRIMARY KEY (id),
  KEY submission_queue (status, received_at),
  CONSTRAINT submission_entry FOREIGN KEY (entry_ref) REFERENCES entry (ref)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Who changed what, when: editors, approvals and imports.
CREATE TABLE audit_event (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  entity     VARCHAR(40)  NOT NULL COMMENT 'entry | submission | taxonomy_term | party | place | import',
  entity_id  VARCHAR(160) NOT NULL,
  action     ENUM('create', 'update', 'publish', 'retire', 'approve', 'reject', 'import') NOT NULL,
  actor      VARCHAR(120) NOT NULL,
  at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  diff       JSON         NULL,
  PRIMARY KEY (id),
  KEY audit_event_entity (entity, entity_id, at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- The one-off load from the Sheet (and any later bulk import).
CREATE TABLE import_run (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  imported_at    DATETIME(3)  NOT NULL,
  source         VARCHAR(200) NOT NULL COMMENT 'Workbook file or Sheet ID',
  entry_count    INT          NOT NULL,
  warning_count  INT          NOT NULL,
  report         MEDIUMTEXT   NULL COMMENT 'import-report.md of the run',
  PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
