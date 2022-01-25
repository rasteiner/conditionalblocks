<?php

namespace rasteiner\conditionalBlocks;

use Kirby\Form\Field\LayoutField as OriginalLayoutField;

class LayoutField extends OriginalLayoutField {
    protected $requires = null;

    public function __construct(array $params)
    {
        $this->requires = $params['requires'] ?? null;
        parent::__construct($params);
    }

    public function getRequires(): array {
        $min = $this->requires['min'] ?? [];
        $max = $this->requires['max'] ?? [];

        $constraints = [];

        foreach (['min', 'max'] as $varname) {
            $constraint = $$varname;

            if(!is_array($constraint)) {
                $$varname = [];
                continue;
            }

            foreach ($constraint as $columnWidth => $fields) {
                //check if columnWidth is a number smaller than 1 or matches the pattern "^\d/\d$"
                if(is_numeric($columnWidth)) {
                    $columnWidth = floatval($columnWidth);
                } else if(preg_match('|^(\d)/(\d)$|', $columnWidth, $matches)) {
                    $columnWidth = intval($matches[1]) / intval($matches[2]);
                } else {
                    continue;
                }

                if(is_string($fields)) {
                    $fields = [$fields];
                }

                foreach ($fields as $field) {
                    if(!is_string($field)) {
                        continue;
                    }

                    $constraints[$field][$varname] = $columnWidth;
                }
            }
        }

        return $constraints;
    }

    public function props(): array
    {
        return array_merge(parent::props(), [
            'requires' => $this->getRequires(),
        ]);
    }
}