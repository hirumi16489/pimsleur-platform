
## ✅ SETUP DEV

```bash
bash scripts/setup-dev.sh
```

---

## ✅ Git (Monorepo Helpers)

You can use `git mono` (added by `scripts/setup-dev.sh`) instead of `git` inside subfolders to always act from the **repo root**:

```bash
git mono status
git mono add .
```

---

## ✅ Node Version

🔧 Requires **Node.js 24.3.0**  
(Automatically handled via **ASDF** and `.tool-versions`)

```bash
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
asdf install
```