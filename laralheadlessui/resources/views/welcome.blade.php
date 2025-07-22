@extends('layouts.app')

@section('content')
    @php
    $components = [
        ['Button', '<x-button>Valider</x-button>'],
        ['Input', '<x-input placeholder="Votre email" />'],
        ['Select', '<x-select><option>Option 1</option><option>Option 2</option></x-select>'],
        ['Checkbox', '<x-checkbox checked />'],
        ['Radio', '<x-radio name="radio-demo" checked />'],
        ['Switch', '<x-switch />'],
        ['Textarea', '<x-textarea rows="2">Texte ici...</x-textarea>'],
        ['Badge', '<x-badge>Badge</x-badge>'],
        ['Avatar', '<x-avatar>JD</x-avatar>'],
        ['Breadcrumbs', '<x-breadcrumbs><li>Accueil</li><li>Section</li><li>Page</li></x-breadcrumbs>'],
        ['Progress', '<x-progress value="60" />'],
        ['Spinner', '<x-spinner />'],
        ['Collapse', '<x-collapse><div class="p-2">Contenu repliable</div></x-collapse>'],
        ['Pagination', '<x-pagination><span>1</span><span class="font-bold">2</span><span>3</span></x-pagination>'],
        ['Tooltip', '<x-tooltip content="Astuce !"><x-button>Survolez-moi</x-button></x-tooltip>'],
        ['Divider', '<x-divider />'],
        ['Popover', '<x-popover><x-button>Popover</x-button></x-popover>'],
        ['Dropdown', '<x-dropdown><x-button>Dropdown</x-button></x-dropdown>'],
        ['Stepper', '<x-stepper><span>Étape 1</span><span>Étape 2</span></x-stepper>'],
        ['Slider', '<x-slider value="50" />'],
        ['Tag', '<x-tag>Tag</x-tag>'],
        ['Timeline', '<x-timeline><li>Début</li><li>Milieu</li><li>Fin</li></x-timeline>'],
        ['Statistic', '<x-statistic value="42">Utilisateurs</x-statistic>'],
        ['Empty', '<x-empty>Aucune donnée</x-empty>'],
        ['Form', '<x-form><x-formcontrol label="Nom"><x-input /></x-formcontrol></x-form>'],
        ['Drawer', '<x-drawer><div>Contenu du drawer</div></x-drawer>'],
        ['Upload', '<x-upload />'],
        ['Image', '<x-image src="https://placehold.co/100x100" alt="Demo" />'],
        ['Affix', '<x-affix><x-button>Affixé</x-button></x-affix>'],
        ['Anchor', '<x-anchor href="#">Lien ancre</x-anchor>'],
        ['Descriptions', '<x-descriptions><div><dt>Nom</dt><dd>John Doe</dd></div></x-descriptions>'],
        ['Mentions', '<x-mentions>@john</x-mentions>'],
        ['FormControl', '<x-formcontrol label="Bio"><x-texteditor rows="2">Votre bio...</x-texteditor></x-formcontrol>'],
        ['TextEditor', '<x-texteditor rows="2">Votre bio...</x-texteditor>'],
        ['Sidebar', '<x-sidebar><ul><li class="p-2">Menu 1</li></ul></x-sidebar>'],
        ['Autocomplete', '<x-autocomplete placeholder="Chercher..." />'],
        ['Charts', '<x-charts>Graphique ici</x-charts>'],
        ['Calendar', '<x-calendar>Calendrier ici</x-calendar>'],
        ['Combobox', '<x-combobox placeholder="Choisir..." />'],
    ];
    @endphp
    <section id="components" class="mb-16">
        <h2 class="text-2xl font-bold mb-6 text-blue-700">Composants UI</h2>
        <div class="space-y-10">
            @foreach ($components as [$name, $code])
                <x-card>
                    <div class="flex flex-col md:flex-row md:items-center md:gap-8">
                        <div class="flex-1 mb-4 md:mb-0">
                            <h3 class="font-semibold text-lg mb-2">{{ $name }}</h3>
                            {!! $code !!}
                        </div>
                        <div class="bg-gray-100 rounded p-3 text-xs font-mono text-gray-700 overflow-x-auto min-w-[200px]">
                            <pre><code>{{ htmlentities($code) }}</code></pre>
                        </div>
                    </div>
                </x-card>
            @endforeach
        </div>
    </section>
    <section id="install" class="mb-16">
        <h2 class="text-2xl font-bold mb-6 text-blue-700">Installation</h2>
        <x-card>
            <ol class="list-decimal pl-6 space-y-2 text-sm">
                <li>Installer le package (exemple) :<br>
                    <code class="bg-gray-100 px-2 py-1 rounded">composer require martin-lechene/larappeui</code>
                </li>
                <li>Publier les composants Blade :<br>
                    <code class="bg-gray-100 px-2 py-1 rounded">php artisan vendor:publish --tag=larappeui-components</code>
                </li>
                <li>Configurer TailwindCSS :<br>
                    <code class="bg-gray-100 px-2 py-1 rounded">@import 'tailwindcss/forms';<br>@import 'tailwindcss/typography';<br>@import 'tailwindcss/aspect-ratio';</code>
                </li>
                <li>Utiliser les composants dans vos vues Blade :<br>
                    <code class="bg-gray-100 px-2 py-1 rounded">&lt;x-button&gt;Valider&lt;/x-button&gt;</code>
                </li>
            </ol>
        </x-card>
    </section>
@endsection
