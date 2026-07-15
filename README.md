# MatchCareer — Frontend

Application Nuxt 3 (Vue 3, JavaScript, SSR).

## Prérequis

- Node >= 20
- pnpm >= 9

## Démarrage

```bash
pnpm install
pnpm dev
```

## Commandes

| Commande        | Rôle                  |
| --------------- | --------------------- |
| `pnpm dev`      | Serveur de dev        |
| `pnpm build`    | Build production      |
| `pnpm preview`  | Prévisualise le build |
| `pnpm generate` | Génération statique   |
| `pnpm lint`     | ESLint                |
| `pnpm format`   | Prettier              |

## Structure

```
assets/css/   tokens.css, tailwind, styles globaux
components/    composants réutilisables
composables/  logique partagée
layouts/      default.vue, auth.vue
middleware/    guards de route
pages/         routing file-based
plugins/       plugins Nuxt
stores/        stores Pinia
```
