@props([
    'checked' => false,
    'label' => null,
    'disabled' => false,
    'value' => null,
    'name' => null,
])
<label class="inline-flex items-center gap-2 select-none cursor-pointer {{ $disabled ? 'opacity-50 cursor-not-allowed' : '' }}">
    <span class="relative">
        <input
            type="checkbox"
            role="switch"
            @if($checked) checked @endif
            @if($disabled) disabled @endif
            @if($value) value="{{ $value }}" @endif
            @if($name) name="{{ $name }}" @endif
            class="sr-only peer"
            {{ $attributes }}
        />
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition"></div>
        <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
    </span>
    @if($label)
        <span>{{ $label }}</span>
    @endif
</label> 