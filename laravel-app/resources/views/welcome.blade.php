<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel 12 + Livewire Headless UI</title>
    @vite(['resources/css/app.css'])
    @livewireStyles
</head>
<body class="bg-gray-100 min-h-screen p-8">
    <h1 class="text-2xl font-bold mb-8">Composants Headless UI (Livewire)</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h2 class="font-semibold mb-2">Dialog (Modal)</h2>
            <livewire:headless-u-i.dialog />
        </div>
        <div>
            <h2 class="font-semibold mb-2">Menu (Dropdown)</h2>
            <livewire:headless-u-i.menu />
        </div>
        <div>
            <h2 class="font-semibold mb-2">Listbox (Select)</h2>
            <livewire:headless-u-i.listbox :options="['Option 1', 'Option 2', 'Option 3']" />
        </div>
        <div>
            <h2 class="font-semibold mb-2">Switch (Toggle)</h2>
            <livewire:headless-u-i.switch-toggle />
        </div>
        <div>
            <h2 class="font-semibold mb-2">Tabs</h2>
            <livewire:headless-u-i.tabs :tabs="['Tab 1', 'Tab 2', 'Tab 3']" />
        </div>
        <div>
            <h2 class="font-semibold mb-2">Disclosure (Accordion)</h2>
            <livewire:headless-u-i.disclosure />
        </div>
        <div>
            <h2 class="font-semibold mb-2">Combobox (Autocomplete)</h2>
            <livewire:headless-u-i.combobox :options="['Apple', 'Banana', 'Cherry']" />
        </div>
        <div>
            <h2 class="font-semibold mb-2">Popover</h2>
            <livewire:headless-u-i.popover />
        </div>
        <div>
            <h2 class="font-semibold mb-2">RadioGroup</h2>
            <livewire:headless-u-i.radiogroup :options="['A', 'B', 'C']" />
        </div>
        <div>
            <h2 class="font-semibold mb-2">Transition (utilisé dans les autres composants)</h2>
            <livewire:headless-u-i.transition />
        </div>
    </div>
    @livewireScripts
</body>
</html>