@props([
    'label' => null,
    'color' => 'primary', // primary, secondary, danger, etc.
    'size' => 'md', // sm, md, lg
    'dot' => false,
    'bordered' => false,
])
@php
    $colors = [
        'primary' => 'bg-blue-100 text-blue-800',
        'secondary' => 'bg-gray-100 text-gray-800',
        'danger' => 'bg-red-100 text-red-800',
        'success' => 'bg-green-100 text-green-800',
        'warning' => 'bg-yellow-100 text-yellow-800',
    ];
    $sizes = [
        'sm' => 'px-2 py-0.5 text-xs',
        'md' => 'px-2.5 py-0.5 text-xs',
        'lg' => 'px-3 py-1 text-sm',
    ];
    $classes = 'inline-flex items-center font-medium rounded-full '.($colors[$color] ?? $colors['primary']).' '.($sizes[$size] ?? $sizes['md']).($bordered ? ' border border-current' : '');
@endphp
<span {{ $attributes->merge(['class' => $classes]) }}>
    @if($dot)
        <span class="w-2 h-2 mr-1 rounded-full bg-current inline-block"></span>
    @endif
    {{ $label ?? $slot }}
</span> 