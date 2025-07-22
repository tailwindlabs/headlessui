<button {{ $attributes->merge(['class' => 'inline-flex items-center justify-center px-4 py-2 rounded-sm font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none']) }}>
    {{ $slot }}
</button> 