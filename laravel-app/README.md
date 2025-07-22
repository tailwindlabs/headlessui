# Laravel 12 + Livewire + Tailwind CSS

Ce projet est une base Laravel 12 avec Livewire et une architecture orientée composants.

## Prérequis
- PHP >= 8.2
- Composer
- Node.js & npm

## Installation

```bash
# Installer les dépendances PHP
composer install

# Installer les dépendances JS
npm install

# Compiler les assets
npm run dev

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Lancer le serveur de développement
php artisan serve
```

## Livewire
Un exemple de composant Livewire est disponible dans `app/Livewire/Counter.php`.

## Tailwind CSS
La configuration Tailwind est prête dans `tailwind.config.js` et `resources/css/app.css`.