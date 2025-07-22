@props([
    'label' => null,
    'color' => 'primary', // primary, secondary, danger, etc.
    'size' => 'md', // sm, md, lg
    'icon' => null,
    'loading' => false,
    'disabled' => false,
    'outline' => false,
    'block' => false,
    'type' => 'button',
])

@php
    $base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    $colors = [
        'primary' => $outline ? 'border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 focus:ring-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        'secondary' => $outline ? 'border border-gray-400 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-400' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400',
        'danger' => $outline ? 'border border-red-600 text-red-600 bg-white hover:bg-red-50 focus:ring-red-500' : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ];
    $sizes = [
        'sm' => 'px-3 py-1.5 text-xs rounded',
        'md' => 'px-4 py-2 text-sm rounded-md',
        'lg' => 'px-6 py-3 text-base rounded-lg',
    ];
    $classes = $base . ' ' . ($colors[$color] ?? $colors['primary']) . ' ' . ($sizes[$size] ?? $sizes['md']) . ($block ? ' w-full' : '');
@endphp

<button type="{{ $type }}" {{ $attributes->merge(['class' => $classes, 'disabled' => $disabled || $loading]) }}>
    @if($loading)
        <svg class="animate-spin h-4 w-4 mr-2 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
    @elseif($icon)
        <span class="mr-2">{!! $icon !!}</span>
    @endif
    {{ $label ?? $slot }}
</button> 