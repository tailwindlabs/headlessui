@props([
    'options' => [], // [{label, value}]
    'label' => null,
    'value' => null,
    'disabled' => false,
    'error' => false,
    'name' => null,
    'inline' => false,
])
<div class="w-full">
    @if($label)
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $label }}</label>
    @endif
    <div class="flex {{ $inline ? 'flex-row gap-4' : 'flex-col gap-2' }}">
        @foreach($options as $option)
            <label class="inline-flex items-center gap-2 select-none cursor-pointer {{ $disabled ? 'opacity-50 cursor-not-allowed' : '' }}">
                <input
                    type="radio"
                    name="{{ $name }}"
                    value="{{ is_array($option) ? ($option['value'] ?? $option['label'] ?? $option) : $option }}"
                    @if($value == (is_array($option) ? ($option['value'] ?? $option['label'] ?? $option) : $option)) checked @endif
                    @if($disabled) disabled @endif
                    {{ $attributes->merge(['class' => 'border-gray-300 text-blue-600 shadow-sm focus:ring focus:ring-blue-500 focus:ring-opacity-50 '.($error ? 'border-red-500' : '')]) }}
                />
                <span>{{ is_array($option) ? ($option['label'] ?? $option['value'] ?? $option) : $option }}</span>
            </label>
        @endforeach
        {{ $slot ?? '' }}
    </div>
    @if($error)
        <p class="mt-1 text-xs text-red-600">{{ is_string($error) ? $error : 'Erreur' }}</p>
    @endif
</div> 