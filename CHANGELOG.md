# Changelog

## 0.6.1
* Wrong position of arrow when scrolling and smallipop realigns itself
* Mouseout for trigger works again

## 0.6.0
* Done a lot of refactoring. Minified versions of js and css lost some KB.
* Tooltip arrows are now using :after and :before pseudo elements. Thanks to https://github.com/zalog for this patch. These arrows won't show up when using IE7 and earlier.
* All css classes are now using dashes. This simplifies a lot of things and makes the plugin more consistent. You should check your custom themes. 
* The default inline hint class is now smallipop-hint instead of smallipopHint. But this is still available as option, so you can use your old smallipopHint class.
