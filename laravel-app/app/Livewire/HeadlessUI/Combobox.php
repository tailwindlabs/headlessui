<?php

namespace App\Livewire\HeadlessUI;

use Livewire\Component;

class Combobox extends Component
{
    public string $query = '';
    public array $options = [];
    public $selected = null;

    public function mount($options = [])
    {
        $this->options = $options;
    }

    public function select($option)
    {
        $this->selected = $option;
    }

    public function render()
    {
        return view('livewire.headlessui.combobox');
    }
}