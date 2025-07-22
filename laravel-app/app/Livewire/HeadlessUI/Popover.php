<?php

namespace App\Livewire\HeadlessUI;

use Livewire\Component;

class Popover extends Component
{
    public bool $open = false;

    public function toggle()
    {
        $this->open = !$this->open;
    }

    public function render()
    {
        return view('livewire.headlessui.popover');
    }
}