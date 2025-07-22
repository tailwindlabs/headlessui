<?php

namespace App\Livewire\HeadlessUI;

use Livewire\Component;

class Dialog extends Component
{
    public bool $open = false;

    public function open()
    {
        $this->open = true;
    }

    public function close()
    {
        $this->open = false;
    }

    public function render()
    {
        return view('livewire.headlessui.dialog');
    }
}