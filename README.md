# Kirby Conditional Blocks plugin

## Installation

### Download

Download and copy this repository to `/site/plugins/conditional-blocks`.

### Git submodule

```
git submodule add https://github.com/rasteiner/conditionalblocks site/plugins/conditional-blocks
```

### Composer

```
composer require rasteiner/conditionalblocks
```

## Blueprint Example

```yml 

fields:
  layout:
    type: layout
    layouts:
      - "1/1"
      - "1/2, 1/4, 1/4"
      - "1/6, 5/6"

    requires:
      min:
        1/3:
          - image
          - video
          - code
      max:
        1/2: text

    fieldsets:
      - text
      - image
      - video
      - code
```

## License

MIT
