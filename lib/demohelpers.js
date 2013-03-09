/* General demo helpers */
$(function() {
    // Floating side menu
    var sideMenu = $(".side-menu"),
        sideMenuItems = $("a", sideMenu),
        sideMenuMinY = $(".page").position().top,
        lastSideMenuY = -1,
        currentSideMenuItem = 0;

    window.prettyPrint && prettyPrint()

    $(window).scroll(function(e) {
        var scrollY = $(document).scrollTop();

        if (scrollY == lastSideMenuY)
            return;

        lastSideMenuY = scrollY;

        // Move floating menu
        if (scrollY > sideMenuMinY) {
            sideMenu.css({
                position: "fixed",
                top: 0
            });
        } else {
            sideMenu.css({
                position: "absolute",
                top: sideMenuMinY
            });
        }

        // Check where we are in the document
        var currentItem = 0, itemY = 0;
        for (var i = 0; i < sideMenuItems.length; i++) {
            itemY = $(sideMenuItems.eq(i).attr("href")).position().top;
            if (itemY < scrollY)
                currentItem = i;
            else
                break;
        }

        // Switch current menu item
        if (currentSideMenuItem != currentItem) {
            currentSideMenuItem = currentItem;

            // Remove current class from inactive items
            sideMenuItems.not(":eq(" + currentItem + ")").removeClass("current");
            // Highlight current item
            sideMenuItems.eq(currentItem).addClass("current");
        }
    }).trigger("scroll");

    // Collapsable contentelements
    $('.collapsor').click(function(e) {
        e.preventDefault();
        var self = $(this);
        self.slideUp(300, function() {
            $(self.attr('href')).slideDown(300);
        });
    });

    // Smooth scroller for menu
    $('.scrollToId').click(function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top
        }, 800, 'swing');
    });

    // Smallipop creation calls
    $('.smallipop').smallipop();

    $('.smallipopOrange').smallipop({
        theme: 'orange'
    });
    $('.smallipopBlack').smallipop({
        theme: 'black'
    });
    $('.smallipopHideBlack').smallipop({
        theme: 'black',
        hideTrigger: true
    });

    $('.smallipopBlue').smallipop({
        theme: 'blue',
        invertAnimation: true
    });

    $('.smallipopBlueFatShadow').smallipop({
        theme: 'blue fatShadow',
        invertAnimation: true
    });

    $('.smallipopHideBlue').smallipop({
        theme: 'blue',
        hideTrigger: true,
        popupYOffset: 40,
        invertAnimation: true
    });

    $('.smallipopWhite').smallipop({
        theme: 'white'
    });

    $('.smallipopHide').smallipop({
        hideTrigger: true,
        theme: 'white',
        popupYOffset: 5
    });

    $('.smallipopHideTrans').smallipop({
        hideTrigger: true,
        theme: 'white whiteTransparent',
        popupYOffset: 20
    });

    $('.smallipopStatic').smallipop({
        theme: 'black',
        popupDistance: 0,
        popupYOffset: -14,
        popupAnimationSpeed: 100
    });

    $('.smallipopBottom').smallipop({
        theme: 'black',
        preferredPosition: 'bottom'
    });

    $('.smallipopHorizontal').smallipop({
        preferredPosition: 'right',
        theme: 'black',
        popupOffset: 10,
        invertAnimation: true
    });

    $('.smallipopFormElement').smallipop({
        preferredPosition: 'right',
        theme: 'black',
        popupOffset: 0,
        triggerOnClick: true
    });

    $('#tipcustomhint').smallipop({}, "I'm the real hint!");

    $(document).delegate('#tipkiller', 'click', function(e) {
        e.preventDefault();
        $('#ajaxContainer').html('<div>Some new content</div>');
    });

    $(document).delegate('#tipkiller2', 'click', function(e) {
        e.preventDefault();
        $('#ajaxContainer2').html("<div>Some new content</div>");
    });

    $('#tipChangeContent').smallipop({
        onAfterShow: function(trigger) {
            $.smallipop.setContent(trigger, "I'm the new content and I have replaced the old boring content!");
        },
        onBeforeHide: function(trigger) {
            $.smallipop.setContent(trigger, "Bye bye");
        }
    });

    $('#tipCSSAnimated').smallipop({
        cssAnimations: {
            enabled: true,
            show: 'animated bounceInDown',
            hide: 'animated hinge'
        }
    });

    $('#tipCSSAnimated2').smallipop({
        cssAnimations: {
            enabled: true,
            show: 'animated flipInX',
            hide: 'animated flipOutX'
        }
    });

    $('#tipCSSAnimated3').smallipop({
        cssAnimations: {
            enabled: true,
            show: 'animated fadeInLeft',
            hide: 'animated fadeOutRight'
        }
    });

    $('#tipCSSAnimated4').smallipop({
        cssAnimations: {
            enabled: true,
            show: 'animated rotateInDownLeft',
            hide: 'animated rotateOutUpRight'
        }
    });

    $('#tipDontHideOnTriggerClick').smallipop({
        hideOnTriggerClick: false
    });
    $('#tipDontHideOnContentClick').smallipop({
        hideOnPopupClick: false
    });

    $('.smallipopTour').smallipop({
        theme: 'black',
        cssAnimations: {
            enabled: true,
            show: 'animated flipInX',
            hide: 'animated flipOutX'
        }
    });

    $('#runTour').click(function() {
        $('.smallipopTour').smallipop('tour');
    });

    // Animate smallipops when scrolling
    if ($('.wobbler').length) {
        $(document).scroll(function() {
            var wobblers = $('.wobbler:not(.wobble)'),
                win = $(window);
            wobblers.each(function() {
                var self = $(this);
                offset = self.offset();
                if (offset.top > win.scrollTop() + 50 && offset.top < win.scrollTop() - 50 + win.height())
                    self.addClass('wobble');
            })
        }).trigger('scroll');
    }



    // Special 3rd party script calls
    var hostname = document.location.hostname;
    if (hostname && (hostname.indexOf('github') >= 0 || hostname.indexOf('sebastianhelzle') >= 0)) {
        // Piwik tracking
        try {
            var piwikTracker = Piwik.getTracker(pkBaseURL + "piwik.php", 5);
            piwikTracker.trackPageView();
            piwikTracker.enableLinkTracking();
        } catch( err ) {}

        // Addthis code
        document.write(unescape("%3Cscript src='http://s7.addthis.com/js/250/addthis_widget.js#pubid=sebobo' type='text/javascript'%3E%3C/script%3E"));

        // Flattr button
        var s = document.createElement('script'), t = document.getElementsByTagName('script')[0];
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'http://api.flattr.com/js/0.6/load.js?mode=auto';
        t.parentNode.insertBefore(s, t);
    }
});
