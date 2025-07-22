@props([
    'label' => null,
    'value' => null,
    'placeholder' => null,
    'disabled' => false,
    'readonly' => false,
    'error' => null,
    'prefix' => null,
    'suffix' => null,
    'clearable' => false,
    'maxlength' => null,
    'minlength' => null,
    'rows' => 3,
])
<div class="w-full">
    @if($label)
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $label }}</label>
    @endif
    <div class="relative flex items-center">
        @if($prefix)
            <span class="mr-2 text-gray-400">{!! $prefix !!}</span>
        @endif
        <textarea
            rows="{{ $rows }}"
            @if($placeholder) placeholder="{{ $placeholder }}" @endif
            @if($disabled) disabled @endif
            @if($readonly) readonly @endif
            @if($maxlength) maxlength="{{ $maxlength }}" @endif
            @if($minlength) minlength="{{ $minlength }}" @endif
            {{ $attributes->merge(['class' => 'block w-full px-3 py-2 border '.($error ? 'border-red-500' : 'border-gray-300').' rounded-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm']) }}
        >{{ old($attributes->get('name'), $value) ?? $slot ?? '' }}</textarea>
        @if($clearable && !$disabled && !$readonly)
            <button type="button" class="absolute right-2 text-gray-400 hover:text-gray-600 focus:outline-none" onclick="this.previousElementSibling.value='';this.previousElementSibling.dispatchEvent(new Event('input'))">&times;</button>
        @elseif($suffix)
            <span class="ml-2 text-gray-400">{!! $suffix !!}</span>
        @endif
    </div>
    @if($error)
        <p class="mt-1 text-xs text-red-600">{{ is_string($error) ? $error : 'Erreur' }}</p>
    @endif
</div> 