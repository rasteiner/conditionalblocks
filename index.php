<?php 

use Kirby\Cms\App;

load([
    'rasteiner\\conditionalBlocks\\LayoutField' => 'LayoutField.php',
], __DIR__ . '/lib');

App::plugin('rasteiner/conditionalblocks', [
    'fields' => [
        'layout' => 'rasteiner\\conditionalBlocks\\LayoutField',
    ]
]);