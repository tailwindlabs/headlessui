<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>LarappeUI</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-50 text-gray-900 font-sans min-h-screen flex flex-col">
    <!-- Header -->
    <header class="w-full bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <span class="text-xl font-bold text-blue-600">LarappeUI</span>
            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">for Laravel</span>
        </div>
        <nav class="flex gap-6 text-sm">
            <a href="#components" class="hover:text-blue-600">Composants</a>
            <a href="#install" class="hover:text-blue-600">Installation</a>
            <a href="https://github.com/martin-lechene/" target="_blank" class="hover:text-blue-600">Github</a>
        </nav>
    </header>
    <!-- Hero -->
    <section class="bg-blue-50 py-12 px-4 text-center border-b border-blue-100">
        <h1 class="text-4xl font-bold mb-2 text-blue-700">LarappeUI</h1>
        <p class="text-lg text-blue-900 mb-6">Une collection de composants UI inspirés de FrappeUI pour Laravel 12+ & TailwindCSS</p>
        <a href="#install" class="inline-block bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition">Installer maintenant</a>
    </section>
    <!-- Main Content -->
    <main class="flex-1 w-full max-w-4xl mx-auto py-10 px-4">
        @yield('content')
    </main>
    <!-- Footer -->
    <footer class="w-full bg-white border-t border-gray-200 py-6 mt-10 text-center text-sm text-gray-500">
        <div class="mb-2">
            <a href="https://github.com/martin-lechene/" target="_blank" class="hover:text-blue-600 underline">Github</a> |
            <a href="https://linkedin.com/in/martin-lechene/" target="_blank" class="hover:text-blue-600 underline">LinkedIn</a>
        </div>
        <div>&copy; {{ date('Y') }} LarappeUI. Inspiré par <a href="https://ui.frappe.io/" class="underline hover:text-blue-600" target="_blank">FrappeUI</a>.</div>
    </footer>
</body>
</html> 