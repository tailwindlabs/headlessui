@props([
    'open' => false,
    'title' => null,
    'icon' => null,
    'disabled' => false,
])
@php
    $collapseId = 'collapse-' . uniqid();
@endphp
<div {{ $attributes->merge(['class' => 'border rounded shadow-sm']) }}>
    <button type="button" class="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-t disabled:opacity-50" data-toggle="collapse" data-target="#{{ $collapseId }}" @if($disabled) disabled @endif onclick="const c = document.getElementById('{{ $collapseId }}'); c.classList.toggle('hidden');">
        <span class="flex items-center gap-2">
            @if($icon)
                {!! $icon !!}
            @endif
            {{ $title }}
        </span>
        <svg class="w-4 h-4 ml-2 transition-transform" :class="{'rotate-180': !document.getElementById('{{ $collapseId }}').classList.contains('hidden')}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
    </button>
    <div id="{{ $collapseId }}" class="px-4 py-2 {{ $open ? '' : 'hidden' }}">
        {{ $slot }}
    </div>
</div> 