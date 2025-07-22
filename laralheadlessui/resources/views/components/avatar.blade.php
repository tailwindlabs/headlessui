@props([
    'src' => null,
    'alt' => '',
    'size' => 'md', // sm, md, lg, xl
    'shape' => 'circle', // circle, square
    'icon' => null,
    'color' => 'gray',
    'bordered' => false,
])
@php
    $sizes = [
        'sm' => 'h-8 w-8 text-sm',
        'md' => 'h-10 w-10 text-base',
        'lg' => 'h-14 w-14 text-lg',
        'xl' => 'h-20 w-20 text-xl',
    ];
    $shapes = [
        'circle' => 'rounded-full',
        'square' => 'rounded',
    ];
    $colors = [
        'gray' => 'bg-gray-200 text-gray-600',
        'blue' => 'bg-blue-100 text-blue-700',
        'red' => 'bg-red-100 text-red-700',
        'green' => 'bg-green-100 text-green-700',
        'yellow' => 'bg-yellow-100 text-yellow-700',
    ];
    $classes = 'inline-flex items-center justify-center '.($sizes[$size] ?? $sizes['md']).' '.($shapes[$shape] ?? $shapes['circle']).' '.($colors[$color] ?? $colors['gray']).($bordered ? ' border border-gray-300' : '');
@endphp
@if($src)
    <img src="{{ $src }}" alt="{{ $alt }}" class="object-cover {{ $classes }}" />
@else
    <span {{ $attributes->merge(['class' => $classes]) }}>
        @if($icon)
            {!! $icon !!}
        @else
            {{ $slot }}
        @endif
    </span>
@endif 