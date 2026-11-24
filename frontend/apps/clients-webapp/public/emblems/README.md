# Official emblems

Municipal flags (`municipalities/`) and institution logos (`institutions/`) shown next to their names on Início, Catálogo and Instituições.

- **Source.** Files come from BVRio: flags from each municipality's official source; logos only with the institution's authorisation. Never copy them from the web.
- **Format.** SVG preferred (PNG ≥ 128 px otherwise). Flags 3:2; logos square, on a transparent or white background.
- **Name.** The catalogue slug: `niteroi.svg`, `uff.svg` (see `/api/catalog/institutions` for institution slugs).
- **Register.** Add the file name to `src/shared/hooks/emblems/emblems.ts`. Unregistered slugs fall back to a monogram (logos) or the dimension icon (flags).
