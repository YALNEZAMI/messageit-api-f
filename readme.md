# messageit-api-f

> Chat application

## About

This project uses [Feathers](http://feathersjs.com). An open source framework for building APIs and real-time applications.

## Getting Started

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/messageit-api-f
    npm install
    ```

3. Start your app

    ```
    npm run compile # Compile TypeScript source
    npm start
    ```

## Lancer avec Docker Compose

Docker et le plugin Compose sont nécessaires. Les deux dossiers
`messageit-api-f` et `messageit-ui-f` doivent être côte à côte. Depuis
`messageit-api-f` :

1. Si le fichier `.env` n'existe pas, copiez `.example.env` vers `.env`.
    Ne remplacez pas un fichier `.env` existant.
2. Définissez dans `.env` un `FEATHERS_SECRET` fort et stable (par exemple,
    générez-le avec `openssl rand -base64 48`). Conservez-le confidentiel :
    le modifier invalide les sessions existantes. Pour utiliser le chatbot,
    renseignez aussi `GEMINI_KEY` et, si nécessaire, `GEMINI_MODEL`.
3. Lancez :

    ```sh
    docker compose up --build -d
    docker compose ps
    ```

Ouvrez [http://localhost:3000](http://localhost:3000). L'API est disponible
sur `http://localhost:3030`. Cette configuration est destinée à un usage
local : les ports sont liés à `127.0.0.1` et MongoDB n'est pas exposé sur
l'hôte. Pour les journaux : `docker compose logs -f`. Pour arrêter les
services sans effacer les données : `docker compose down`.

Compose utilise **une nouvelle base MongoDB locale**, distincte de votre base
Atlas ou de toute base MongoDB existante : les comptes et conversations
existants n'y sont pas automatiquement importés. La valeur `MONGODB_URI` du
fichier `.env` est remplacée dans le conteneur par l'adresse de ce service.
Les données MongoDB et les fichiers téléversés sont conservés dans des volumes
Docker nommés, y compris après reconstruction des images et `docker compose
down`. `docker compose down -v` supprime ces volumes et donc ces données.

Gardez `.env` hors du dépôt. La base MongoDB locale n'a pas d'authentification :
ne rendez pas ce déploiement accessible publiquement sans le sécuriser. Les
URLs configurées sont destinées au navigateur sur cette même machine, pas à
un accès depuis un autre appareil. Pour les personnes qui utilisent l'ancienne
configuration Docker, le service API s'appelle désormais `api` au lieu de `app`.

## Testing

Run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

This app comes with a powerful command line interface for Feathers. Here are a few things it can do:

```
$ npx feathers help                           # Show all commands
$ npx feathers generate service               # Generate a new Service
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).
