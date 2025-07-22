@props([
    'label' => null,
    'placeholder' => null,
    'value' => null,
    'disabled' => false,
    'error' => null,
    'clearable' => false,
    'searchable' => false,
    'multiple' => false,
    'loading' => false,
    'optionLabel' => 'label',
    'optionValue' => 'value',
    'options' => [],
])
<div class="w-full">
    @if($label)
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $label }}</label>
    @endif
    <div class="relative">
        <select
            @if($multiple) multiple @endif
            @if($disabled) disabled @endif
            {{ $attributes->merge(['class' => 'block w-full px-3 py-2 border '.($error ? 'border-red-500' : 'border-gray-300').' rounded-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm']) }}
        >
            @if($placeholder)
                <option value="" disabled selected hidden>{{ $placeholder }}</option>
            @endif
            @foreach($options as $option)
                <option value="{{ is_array($option) ? ($option[$optionValue] ?? $option['value'] ?? $option) : $option }}"
                    @if($value == (is_array($option) ? ($option[$optionValue] ?? $option['value'] ?? $option) : $option)) selected @endif>
                    {{ is_array($option) ? ($option[$optionLabel] ?? $option['label'] ?? $option) : $option }}
                </option>
            @endforeach
            {{ $slot ?? '' }}
        </select>
        @if($loading)
            <span class="absolute right-2 top-2 animate-spin text-gray-400">
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            </span>
        @endif
        @if($clearable && !$disabled)
            <button type="button" class="absolute right-8 top-2 text-gray-400 hover:text-gray-600 focus:outline-none" onclick="this.previousElementSibling.value='';this.previousElementSibling.dispatchEvent(new Event('change'))">&times;</button>
        @endif
    </div>
    @if($error)
        <p class="mt-1 text-xs text-red-600">{{ $error }}</p>
    @endif
</div> 