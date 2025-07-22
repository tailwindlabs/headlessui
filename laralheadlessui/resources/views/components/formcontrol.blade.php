<div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-1">{{ $attributes->get('label') }}</label>
    {{ $slot }}
    @if($attributes->get('helpText'))
        <p class="mt-1 text-xs text-gray-500">{{ $attributes->get('helpText') }}</p>
    @endif
    @if($attributes->get('error'))
        <p class="mt-1 text-xs text-red-600">{{ $attributes->get('error') }}</p>
    @endif
</div> 