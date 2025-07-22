<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel 12 + Livewire</title>
    @vite(['resources/css/app.css'])
    @livewireStyles
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div>
        <livewire:counter />
    </div>
    @livewireScripts
</body>
</html>