@props([
    'open' => false,
    'trigger' => 'click', // click, hover, focus
    'position' => 'bottom', // top, right, bottom, left
    'disabled' => false,
    'content' => null,
    'closeOnClickOutside' => true,
])
@php
    $positions = [
        'top' => 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        'right' => 'left-full top-1/2 -translate-y-1/2 ml-2',
        'bottom' => 'top-full left-1/2 -translate-x-1/2 mt-2',
        'left' => 'right-full top-1/2 -translate-y-1/2 mr-2',
    ];
    $popoverClass = 'absolute z-20 hidden group-hover:block group-focus:block bg-white border border-gray-200 rounded shadow p-2 min-w-[160px] text-sm '.($positions[$position] ?? $positions['bottom']);
    if($open) $popoverClass = str_replace('hidden', '', $popoverClass);
@endphp
<div class="relative group {{ $disabled ? 'pointer-events-none opacity-50' : '' }}">
    {{ $slot }}
    @if($content && !$disabled)
        <div class="{{ $popoverClass }}">
            {{ $content }}
        </div>
    @endif
</div> 