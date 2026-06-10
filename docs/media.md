# Media (billed-upload → R2)

Billeder uploades i ITGo Studio og lander i kundens **Cloudflare R2**-bucket (ikke i git-repoet).

## Config (`studio.config.yml`)

```yaml
media_folder: "public/uploads"   # logisk sti (reference i indhold)
public_folder: "/uploads"        # URL-præfiks når billedet vises på sitet
```

Felter der tager billeder bruger `widget: image` (fx `hero.image`, `image_grid.images[].src`,
`seo.og_image`). Studio viser en upload/vælg-knap.

## Hvordan upload virker (Phase B)

1. Studio sender filen til git-gateway'en (`gateway.studio.itgo.dk`) med kundens token.
2. Gateway'en validerer (auth + site-tilladelse) og lægger filen i kundens **R2-bucket**.
3. Indholdet refererer billedet via `public_folder`-URL'en (serveres fra R2 / CF).

Store binære filer ryger altså i R2, ikke i git — repoet forbliver let.

## Begrænsninger / konvention

- Tilladte typer + max-størrelse håndhæves i gateway'en (ikke her).
- Alt-tekst (`alt`) er et separat felt på billed-blokke — brug det (tilgængelighed + SEO).
- Optimering (resize/format) sker i sitets billed-pipeline ved build/serve, ikke ved upload.

## Lokal udvikling uden R2

I dev kan billeder ligge direkte i `public/uploads/`. I produktion overtager R2 via gateway'en.
