# Hanout

Hanout est une application de gestion pour commerce de proximité (suivi des stocks, finances, factures). Ce repo regroupe deux projets :

- **`hanout/`** — Application web (React + Vite + Tailwind).
- **`Application/`** — Application mobile (React Native + Expo Router), pour Android/iOS.

> Une partie du code et de la documentation de ce projet a été réalisée avec l'aide d'outils d'intelligence artificielle (assistance au développement).

## Structure du repo

```
.
├── hanout/         # Web app (Vite/React)
└── Application/    # Mobile app (Expo/React Native)
```

## Web app (`hanout/`)

```bash
cd hanout
npm install
npm run dev      # serveur de dev
npm run build    # build de production
```

## Mobile app (`Application/`)

```bash
cd Application
npm install
npx expo start    # démarrer en mode dev (Expo Go / émulateur)
```

### Générer l'APK

Un APK debug est généré automatiquement par GitHub Actions à chaque push sur `main` qui modifie `Application/` (voir [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml)). L'APK est disponible en téléchargement dans les **Artifacts** du workflow correspondant, onglet *Actions* du repo.

Pour générer l'APK localement :

```bash
cd Application
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
# APK généré dans android/app/build/outputs/apk/debug/
```

## Licence

Voir [`Application/LICENSE`](Application/LICENSE).
