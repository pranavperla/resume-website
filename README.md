# Pranav Perla — `terraform apply` Resume

A resume website styled as a terminal session running `terraform apply`. The career renders as a Terraform plan: jobs, projects, and skills are provisioned as resources, line by line, as you scroll. Plain HTML/CSS/JS — no build step, no dependencies.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Features

- Boot sequence that types `terraform init` / `terraform apply` on load
- Plan output streams in line-by-line as you scroll
- `career.tf` / `career.py` toggle in the title bar — the same resume rendered as a Terraform plan or as Python code (also switchable by typing `python` / `terraform` in the prompt)
- Live prompt at the bottom — try `help`, `whoami`, `entrupy`, `books`, `terraform destroy`
- tmux-style status bar for section navigation
- Respects `prefers-reduced-motion`

## Deploy

Static site — host free on GitHub Pages, Netlify, Vercel, or Cloudflare Pages. Just upload `index.html`, `styles.css`, and `script.js`.
