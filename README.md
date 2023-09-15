# phone-mask-js

Simple phone mask for Phone

## How use

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
See `demo/index.html`