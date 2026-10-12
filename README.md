# Voxel Sanctuary

A desktop-first wellbeing game. Logging small self-care moments earns Wellbeing Points (WP), and those points grow an isometric voxel world that becomes a keepsake and a wallpaper when it's finished.

## Play it

Once GitHub Pages is switched on (Settings → Pages → Source: **GitHub Actions**), every push to `main` publishes the app to https://joshuabh.github.io/VoxelSanctuary/.

## Run it locally

Needs [Node.js](https://nodejs.org) 20 or newer.

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # generator, points, stage and stats tests
npm run build    # type-check and production build
```

## What's here

- **Worlds**: Bonsai Garden (`src/world/bonsai.ts`) and Voxel City (`src/world/city.ts`), registered in `src/world/themes.ts`. Both sit on a shared floating island (`src/world/island.ts`). Every voxel carries the progress value at which it grows in, so the same seed always regrows the same world. Pick a world before you earn your first points, or when you save a finished one as a keepsake.
- **Growth animation**: voxels pop in, staggered by growth order, through one instanced mesh in React Three Fiber (`src/world/VoxelWorld.tsx`). Drag to turn the island; "Replay growth" regrows it from seed.
- **Logging and points**: activity catalogue and point rules (`src/game/activities.ts`), stages (`src/game/stages.ts`), saved locally with a Zustand store (`src/game/store.ts`).
- **Saves**: export your progress to a JSON file and import it on another browser or device (`src/game/save.ts`).
- **Dashboard**: weekly chart (Recharts), category balance, streak, keepsake shelf and a wallpaper preview rendered from the world seed (`src/world/still.ts`).

## Stack

React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Three.js with React Three Fiber, Zustand, Recharts, Vitest.
