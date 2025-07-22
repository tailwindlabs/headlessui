@props([
    'value' => 0,
    'max' => 100,
    'color' => 'blue', // blue, green, red, etc.
    'striped' => false,
    'animated' => false,
    'showLabel' => false,
])
@php
    $colors = [
        'blue' => 'bg-blue-600',
        'green' => 'bg-green-600',
        'red' => 'bg-red-600',
        'yellow' => 'bg-yellow-500',
        'gray' => 'bg-gray-400',
    ];
    $barClass = $colors[$color] ?? $colors['blue'];
    if($striped) $barClass .= ' bg-stripes';
    if($animated) $barClass .= ' animate-pulse';
    $percent = min(100, max(0, ($max > 0 ? ($value / $max) * 100 : 0)));
@endphp
<div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 relative">
    <div class="{{ $barClass }} h-2.5 rounded-full transition-all duration-300" style="width: {{ $percent }}%"></div>
    @if($showLabel)
        <span class="absolute right-2 top-0 text-xs text-gray-700">{{ round($percent) }}%</span>
    @endif
</div> 