@props([
    'total' => null,
    'pageSize' => 10,
    'currentPage' => 1,
    'onPageChange' => null,
    'showSizeChanger' => false,
    'pageSizeOptions' => [10, 20, 50, 100],
    'simple' => false,
])
@php
    $totalPages = $total ? (int) ceil($total / $pageSize) : 1;
@endphp
<nav class="flex items-center justify-center gap-2" aria-label="Pagination">
    @if($simple)
        <button @if($currentPage <= 1) disabled @endif class="px-2 py-1 rounded border text-sm {{ $currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100' }}">&lt;</button>
        <span class="px-2">{{ $currentPage }}</span>
        <button @if($currentPage >= $totalPages) disabled @endif class="px-2 py-1 rounded border text-sm {{ $currentPage >= $totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100' }}">&gt;</button>
    @else
        <button @if($currentPage <= 1) disabled @endif class="px-2 py-1 rounded border text-sm {{ $currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100' }}">Précédent</button>
        @for($i = 1; $i <= $totalPages; $i++)
            <button class="px-2 py-1 rounded border text-sm {{ $i == $currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-100' }}">{{ $i }}</button>
        @endfor
        <button @if($currentPage >= $totalPages) disabled @endif class="px-2 py-1 rounded border text-sm {{ $currentPage >= $totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100' }}">Suivant</button>
        @if($showSizeChanger)
            <select class="ml-4 border rounded text-sm px-2 py-1">
                @foreach($pageSizeOptions as $opt)
                    <option value="{{ $opt }}" @if($opt == $pageSize) selected @endif>{{ $opt }}/page</option>
                @endforeach
            </select>
        @endif
    @endif
    {{ $slot ?? '' }}
</nav> 