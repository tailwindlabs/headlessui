<?php

namespace App\Livewire\HeadlessUI;

use Livewire\Component;

class Tabs extends Component
{
    public int $selected = 0;
    public array $tabs = [];

    public function mount($tabs = [])
    {
        $this->tabs = $tabs;
    }

    public function select($index)
    {
        $this->selected = $index;
    }

    public function render()
    {
        return view('livewire.headlessui.tabs');
    }
}