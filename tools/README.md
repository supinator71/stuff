# Page generator

The site is committed as plain HTML and needs no build step to deploy or edit.
This generator produced those files and can regenerate them.

```bash
python3 tools/build.py      # run from the project root
```

Use it when a change touches every page at once — the clearest case being
`BASE_URL` at the top of `build.py`, which feeds every canonical URL, `og:url`
and the sitemap. Editing that in seventeen files by hand is how you end up with
three canonicals pointing at the wrong host.

For a one-off tweak to a single page, just edit the HTML. It is yours; nothing
depends on it having been generated. If you do edit HTML by hand and later re-run
the generator, it will overwrite your edits — so port them back into
`content_*.py` first, or stop using the generator from that point on.

- `build.py` — templates, page shells, guides, static pages, sitemap, robots
- `content_a…d.py` — per-calculator copy: intro, sections, FAQs, card text
