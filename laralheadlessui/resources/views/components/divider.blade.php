@props([
    'vertical' => false,
    'dashed' => false,
    'label' => null,
])
@if($vertical)
    <div {{ $attributes->merge(['class' => 'h-full w-px bg-gray-200 dark:bg-gray-700 mx-2 '.($dashed ? 'border-l-2 border-dashed' : '')]) }}></div>
@elseif($label)
    <div class="flex items-center text-gray-400 text-xs my-4">
        <div class="flex-1 border-t border-gray-200 dark:border-gray-700 {{ $dashed ? 'border-dashed' : '' }}"></div>
        <span class="px-2">{{ $label }}</span>
        <div class="flex-1 border-t border-gray-200 dark:border-gray-700 {{ $dashed ? 'border-dashed' : '' }}"></div>
    </div>
@else
    <hr {{ $attributes->merge(['class' => 'my-4 border-gray-200 dark:border-gray-700 '.($dashed ? 'border-dashed' : '')]) }} />
@endif 