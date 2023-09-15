# phone-mask-js

Simple phone mask for Phone

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
new PhoneMask('#phone', options);
```

### Options

| Name      | Type | Default | Description                                                         |
|-----------| ------------ |------------------|---------------------------------------------------------------------|
| blurMask  | `boolean` | `true`              | Hide mask when empty value and blur                                 |
| trimMask  | `boolean` | `false`             | Triming mask. See demo `minimal`                                    |
| mask      | `string` | `+7 (___) ___-__-__` | Em-m... This is mask =D                                             |
| softCaret | `string` | `_`                  | Caret from mask option                                              |
| caret     | `string` | `_`                  | Caret show for user. Support two and more char. Not support numbers |

## Detail work

See [demo/index.html](https://htmlpreview.github.io/?https://raw.githubusercontent.com/pivsemdmi/phone-mask-js/master/demo/index.html)
