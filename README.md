Small-I-Pop
=============

[Small Improvements](http://www.small-improvements.com) info popup

This jQuery plugin has been created because all the tooltips we tested didn't meet our requirements.

We wanted: 

 * **Pure css** for the design. Fallbacks for older browsers and no images.
 * **Custom themes** for different use cases. 
 * The popup trigger **can be positioned anywhere**. The popup will be displayed at the body root, so the position won't be affected by your layout.
 * **Automatic orientation** whereever the popup appears. The popup will try to stay in the visible area of the screen, even when scrolling or at the edges.
 * **The popup disappears when a link is clicked**. Important for applications using a lot of ajax.
 * **Only a single popup** element in the document. Some plugins create a hidden popup for each trigger.
 * **Custom options** for each trigger. You can have 20 different popups with 20 different themes on one page if you like.
 * **Small**. Only ~ 3KB minified and ~ 1.6KB gziped.
 
We are starting to use this plugin for a lot of things, so watch for new releases at [github](https://github.com/Sebobo/jquery.smallipop).


Installation
------------

### Prequisites

 * [jQuery](http://www.jquery.com) 1.4.3 or better
 * [Modernizr](http://www.modernizr.com) If you want to use our own themes without modifications, see below.
 
Both are also provided in the `lib` folder. 

If you don't want to use the `Modernizr` library you can remove the `.cssgradients`, `.borderradius`, `.rgba` and `.boxshadow` classes in `css/jquery-smallipop.css`.
I use these to provide easy css fallbacks for browsers with reduced capabilities. 

### Required files

Copy `lib/jquery-smallipop.js` to your javascript folder.
Copy `css/jquery-smallipop.css` to your css folder.


Usage
-----

If you like demos more than a boring documentation see the `index.html` file and play with it.

The plugin can be called with jQuery in different ways.
    
Standard call with default theme and settings:

    $('.myElement').smallipop();
    
Different theme:

    $('.myElement').smallipop({ 
        theme: 'white' 
    });
    
Hide the popup trigger while displaying the popup:

    $('.myElement').smallipop({ 
        hideTrigger: true 
    });
    
Custom hint:

    $('.myElement').smallipop({}, 'This is my special hint');
    
Changing the default options for all new popups:

    $.smallipop.defaults.theme = 'black'


### Popup content and markup    

You can provide a custom text like in the example before.

If `myElement` is a `<a>` tag, the elements title is used as popup text.

If `myElement` contains an element with the `info` class, it's content is copied into the popup when displayed.
This can be any markup content you like. Be careful when using floating elements, they need a clear afterwards or jQuery is unable to get the correct size for the popup.
You can set this class to something different. See the `Options` chapter.


### Options

 * popupOffset: horizontal offset, default is `31` for the default theme.
 * popupYOffset: vertical offset, default is `0`.
 * popupDistance: vertical distance when the popup appears and disappears, default is `20`.
 * hideTrigger: hide the trigger when the popup is shown, default is `false`.
 * theme: `black` and `white` are included in the css file, leave blank for the default theme.
 * infoClass: class in an element which contains markup content for the popup, default is `info` 


Editing
-------

The plugin is written in [coffeescript](http://jashkenas.github.com/coffee-script/) and the css with [sass](http://sass-lang.com/).
The sources are provided in the `src` and `scss` folders.  

So you can either work with the compiled `.js` and `.css` files in your project or use the coffeescript and sass files.

I have provided a combined watcher script `watcher.py` which starts the two watcher daemons, when your editing the files.
This requires the installation of python, coffeescript and sass. You can find very good installation instructions on the project homepages.

The generated css for the themes is quite long. Remove any themes you don't need.

The css used for the popup arrow is a bit tricky. If you want to change it, you need to know how css borders are rendered or you use images instead.


Feedback
--------

Please send me an [email](sebastian@small-improvements.com) with any feedback you have.

This plugin was my first attempt at a custom tooltip, coffeescript and scss, so any ideas for improvement are welcome.


Contributing
------------

Contribute!
