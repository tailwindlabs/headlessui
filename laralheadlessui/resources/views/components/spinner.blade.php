@props([
    'size' => 'md', // sm, md, lg
    'color' => 'blue', // blue, gray, red, etc.
    'thickness' => 4,
])
@php
    $sizes = [
        'sm' => 'h-4 w-4',
        'md' => 'h-5 w-5',
        'lg' => 'h-8 w-8',
    ];
    $colors = [
        'blue' => 'text-blue-600',
        'gray' => 'text-gray-500',
        'red' => 'text-red-600',
        'green' => 'text-green-600',
        'yellow' => 'text-yellow-500',
    ];
    $class = ($sizes[$size] ?? $sizes['md']).' '.($colors[$color] ?? $colors['blue']);
@endphp
<svg class="animate-spin {{ $class }}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="{{ $thickness }}"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
</svg> 