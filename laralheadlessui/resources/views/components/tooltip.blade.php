@props([
    'content' => null,
    'position' => 'top', // top, right, bottom, left
    'trigger' => 'hover', // hover, click, focus
    'open' => false,
    'delay' => 0,
    'disabled' => false,
])
@php
    $positions = [
        'top' => 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        'right' => 'left-full top-1/2 -translate-y-1/2 ml-2',
        'bottom' => 'top-full left-1/2 -translate-x-1/2 mt-2',
        'left' => 'right-full top-1/2 -translate-y-1/2 mr-2',
    ];
    $tooltipClass = 'absolute z-10 hidden group-hover:block group-focus:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow '.($positions[$position] ?? $positions['top']);
    if($open) $tooltipClass = str_replace('hidden', '', $tooltipClass);
@endphp
<span class="relative group {{ $disabled ? 'pointer-events-none opacity-50' : '' }}">
    {{ $slot }}
    @if($content && !$disabled)
        <span class="{{ $tooltipClass }}" style="transition-delay: {{ $delay }}ms;">
            {{ $content }}
        </span>
    @endif
</span> 