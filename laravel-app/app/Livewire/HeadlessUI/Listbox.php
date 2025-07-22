<?php

namespace App\Livewire\HeadlessUI;

use Livewire\Component;

class Listbox extends Component
{
    public $selected = null;
    public array $options = [];

    public function mount($options = [])
    {
        $this->options = $options;
        $this->selected = $options[0] ?? null;
    }

    public function select($option)
    {
        $this->selected = $option;
    }

    public function render()
    {
        return view('livewire.headlessui.listbox');
    }
}