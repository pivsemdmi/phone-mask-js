# phone-mask-js

Simple phone mask for Phone

## Features

* Simple use
* Global override options
* Correcting caret position
* Trimming [87] numbers in beginning of unmasked phone number when overflowed

For example:

> `+7 (871) 234-56-789` -> `+7 (712) 345-67-89`
>
> `+7 (712) 345-67-890` -> `+7 (123) 456-78-90`

## Include it

After installing with npm, you could possibly do from index.html:

```html
<script src="./node_modules/@pivsemdmi/phone-mask-js/phone-mask.js"></script>
```

Use with webpack

```js
const PhoneMask = require('@pivsemdmi/phone-mask-js');
```

## How to use

```js
new PhoneMask('#phone');
new PhoneMask('#phone', options);
```

### Options

| Name      | Type      | Default              | Description                                                         |
|-----------|-----------|----------------------|---------------------------------------------------------------------|
| blurMask  | `boolean` | `true`               | Hide mask when empty value and blur                                 |
| trimMask  | `boolean` | `false`              | Triming mask. See demo `Trimming`                                   |
| mask      | `string`  | `+7 (___) ___-__-__` | Em-m... This is mask =D                                             |
| softCaret | `string`  | `_`                  | Caret from mask option                                              |
| caret     | `string`  | `_`                  | Caret show for user. Support two and more char. Not support numbers |

### Destroy mask

For destroy mask, call `phoneMask.destroy()` method

### Override global options

Call `PhoneMask.Options.override(options)` with new options

For flush call `PhoneMask.Options.flush()`

> Default params available in PhoneMaskOptions class

For example:

```javascript
// Override
PhoneMask.Options.override({
    'caret': 'x',
});

new PhoneMask('#phone');

// Flush
PhoneMask.Options.flush();
// or
PhoneMask.Options.override(new PhoneMaskOptions());
```

---

Also see [demo/index.html](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pivsemdmi/phone-mask-js/master/demo/index.html)
