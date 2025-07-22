<span class="relative group">
    {{ $slot }}
    <span class="absolute z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
        {{ $attributes->get('content') }}
    </span>
</span> 