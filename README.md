# JS Datepicker
Pure JavaScript (VanillaJS) component that implements an interactive date picker

## How to use
To use the datepicker plugin, two main file must be included.
The stylesheet:
```html
<link rel="stylesheet" href="/js-datepicker/dist/css/jdatepicker.min.css" />
```
And the script file (inclusive of all language files)
```html
<script src="/js-datepicker/dist/jdatepicker.min.js"></script>
```
The component must follow this structure
```html
<input name="mydate" data-replace="datepicker" data-locale="en" data-format="d/m/y"
       data-mindate="1/1/2000" data-maxdate="31/12/2000" data-disableddates="5/2/2000,7/5/2000" />
```

## Referencing
Once a jdatepicker has been istantiated, it can be references through the global `window.JDATEPICKER_INSTANCES`.
It is a key-value dictionary, so structured:

* the key is the jdatepicker's instance `name`. It's the value of the `name` attribute in the `<input>` tag, or, if that attribute was empty or not provided, the UNIX timestamp at the time the Jdatepicker was istantiated.

* the value is the jdatepicker object.

For example, a jdatepicker with `name` = `mydate`, can be referenced through:

```javascript
var mydatepicker = window.JDATEPICKER_INSTANCES["mydate"];
```

## Options
Options for the `input` tag:

| attribute name | data type | description | default |
| -------------- | ----------| ----------- | ------- |
| `disabled` | `boolean` | tells if datepicker is disabled | `false` |
| `data-locale` | `string` | lowercase two-letters ISO language code | `'en'` |
| `data-format` | `string` | date format, should contain a separator (like `/`, or `-`) and these letters:<ul><li>`d` for "day"</li><li>`m` for "month"</li><li>`y` for "year"</li> | `'y-m-d'` |
| `data-mindate` | `string` | the smallest available date. Must respect the format specified by `data-format`.<br/>If not provided, no lower bounds are applied | `null` |
| `data-maxdate` | `string` | the biggest available date. Must respect the format specified by `data-format`.<br/>If not provided, no upper bounds are applied | `null` |
| `data-disableddates` | `string` | disabled dates separated by a comma (`,`). Must respect the format specified by `data-format`.<br/>If not provided, no dates will be disabled (Unless `data-mindate` and/or `data-maxdate` are set) | `null` |

## Keyboard shortcuts
While focus remains on datepicker component, the following keyboard shortcuts can be used:
| keys | description |
| ---- | ----------- |
| <kbd>Enter</kbd> | select current date and close picker |
| <kbd>ArrowLeft</kbd> | current date steps one day back |
| <kbd>ArrowRight</kbd> | current date steps one day forward |
| <kbd>ArrowDown</kbd> | current date steps one month forward |
| <kbd>ArrowUp</kbd> | current date steps one month back |
| <kbd>PageDown</kbd> | current date steps one year forward |
| <kbd>PageUp</kbd> | current date steps one year back |

## Events
Plugin provides custom events to intercept changes either in structure or in value.

| event name | description |
| ---------- | ---------------- |
| `jdatepicker-create` | let the DOM know that a INSTANCE of Jdatepicker has been created |
| `jdatepicker-change` | user has changed the value (selected a date) |

## Languages
At the time I'm writing this document, there are only Italian (`it`) and English (`en`) available.<br/>
I don't use automatic translators. I prefer filling only languages that I know.<br/>
Other translation can be easily added in the `/src/locales/locales.js` file.<br/>
Remeber to use the correct ISO two-letter code. See <a href="https://www.loc.gov/standards/iso639-2/php/code_list.php">here</a>

