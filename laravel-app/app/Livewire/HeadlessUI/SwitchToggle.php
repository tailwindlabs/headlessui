<?php

namespace App\Livewire\HeadlessUI;

use Livewire\Component;

class SwitchToggle extends Component
{
    public bool $enabled = false;

    public function toggle()
    {
        $this->enabled = !$this->enabled;
    }

    public function render()
    {
        return view('livewire.headlessui.switch-toggle');
    }
}