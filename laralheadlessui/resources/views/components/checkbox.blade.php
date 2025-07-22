@props([
    'label' => null,
    'checked' => false,
    'disabled' => false,
    'error' => false,
    'indeterminate' => false,
    'value' => null,
    'name' => null,
])
<label class="inline-flex items-center gap-2 select-none cursor-pointer {{ $disabled ? 'opacity-50 cursor-not-allowed' : '' }}">
    <input
        type="checkbox"
        @if($checked) checked @endif
        @if($disabled) disabled @endif
        @if($indeterminate) x-data="{ indeterminate: true }" x-init="$el.indeterminate = true" @endif
        @if($value) value="{{ $value }}" @endif
        @if($name) name="{{ $name }}" @endif
        {{ $attributes->merge(['class' => 'rounded border-gray-300 text-blue-600 shadow-sm focus:ring focus:ring-blue-500 focus:ring-opacity-50 '.($error ? 'border-red-500' : '')]) }}
    />
    @if($label)
        <span>{{ $label }}</span>
    @endif
</label>
@if($error)
    <p class="mt-1 text-xs text-red-600">{{ is_string($error) ? $error : 'Erreur' }}</p>
@endif 