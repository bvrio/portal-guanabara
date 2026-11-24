/**
 * Official emblems: municipal flags and institution logos (v0.6).
 *
 * The files are supplied by BVRio — flags from the municipalities' official
 * sources, logos with each institution's authorisation — and live in
 * `public/emblems/{municipalities,institutions}/`. Register each file here by
 * slug (the same slug the catalogue uses: `niteroi`, `uff`…). Until a slug is
 * registered, the presentation falls back to a monogram (logos) or to the
 * dimension icon (flags). Never copy emblems from the web.
 */
export const municipalityFlagFiles: Readonly<Record<string, string>> = {
  // 'niteroi': 'niteroi.svg',
};

export const institutionLogoFiles: Readonly<Record<string, string>> = {
  // 'uff': 'uff.svg',
};
