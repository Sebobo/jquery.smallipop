/*
General demo helpers for smallipop
*/

var hostname, piwikTracker, s, t;

((function() {
  (function($) {
    var currentSideMenuItem, lastSideMenuY, sideMenu, sideMenuItems, sideMenuMinY;
    sideMenu = $('.side-menu');
    sideMenuItems = $('a', sideMenu);
    sideMenuMinY = $('.page').position().top;
    lastSideMenuY = -1;
    currentSideMenuItem = 0;
    /* Enable prettyprint
    */

    if (typeof window.prettyPrint === "function") {
      window.prettyPrint();
    }
    /* Collapsable contentelements
    */

    $('.collapsor').click(e)(function() {
      var self;
      e.preventDefault();
      self = $(this);
      return self.slideUp(300, function() {
        return $(self.attr('href')).slideDown(300);
      });
    });
    /* Menu scroller
    */

    $(window).scroll(function(e) {
      var currentItem, itemY, scrollY, sideMenuItem, _i, _len;
      scrollY = $(document).scrollTop();
      if (scrollY === lastSideMenuY) {
        return;
      }
      lastSideMenuY = scrollY;
      if (scrollY > sideMenuMinY) {
        sideMenu.css({
          position: 'fixed',
          top: 0
        });
      } else {
        sideMenu.css({
          position: "absolute",
          top: sideMenuMinY
        });
      }
      currentItem = 0;
      for (_i = 0, _len = sideMenuItems.length; _i < _len; _i++) {
        sideMenuItem = sideMenuItems[_i];
        sideMenuItem.removeClass('current');
        itemY = $(sideMenuItem.attr('href')).position().top;
        if (itemY < scrollY) {
          currentItem = i;
        } else {
          break;
        }
      }
      return sideMenuItem.addClass('current');
    }).trigger('scroll');
    /* Smooth scroller for menu
    */

    return $('.scrollToId').click(function(e) {
      e.preventDefault();
      return $('html, body').animate({
        scrollTop: $($(this).attr('href')).offset().top
      }, 800, 'swing');
    });
  });
  /* Smallipop creation calls
  */

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
    return $('#ajaxContainer').html('<div>Some new content</div>');
  });
  $(document).delegate('#tipkiller2', 'click', function(e) {
    e.preventDefault();
    return $('#ajaxContainer2').html('<div>Some new content</div>');
  });
  $('#tipChangeContent').smallipop({
    onAfterShow: function(trigger) {
      return $.smallipop.setContent(trigger, "I'm the new content and I have replaced the old boring content!");
    },
    onBeforeHide: function(trigger) {
      return $.smallipop.setContent(trigger, "Bye bye");
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
    return $('.smallipopTour').smallipop('tour');
  });
  /* Animate smallipops when scrolling
  */

  if ($('.wobbler').length) {
    $(document).scroll(function() {
      var $win, $wobblers, scrollTop, winHeight;
      $wobblers = $('.wobbler:not(.wobble)');
      $win = $(window);
      winHeight = $win.height();
      scrollTop = $win.scrollTop();
      return $wobblers.each(function() {
        var $self, offset;
        $self = $(this);
        offset = $self.offset();
        if (offset.top > scrollTop + 50 && offset.top < scrollTop - 50 + winHeight) {
          return $self.addClass('wobble');
        }
      });
    }).trigger('scroll');
  }
  /* Special 3rd party script calls
  */

  hostname = document.location.hostname;
  if (hostname && (hostname.indexOf('github') >= 0 || hostname.indexOf('sebastianhelzle') >= 0)) {
    try {
      piwikTracker = Piwik.getTracker(pkBaseURL + "piwik.php", 5);
      piwikTracker.trackPageView();
      piwikTracker.enableLinkTracking();
    } catch (err) {

    }
    document.write(unescape("%3Cscript src='http://s7.addthis.com/js/250/addthis_widget.js#pubid=sebobo' type='text/javascript'%3E%3C/script%3E"));
    s = document.createElement('script');
    t = document.getElementsByTagName('script')[0];
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'http://api.flattr.com/js/0.6/load.js?mode=auto';
    return t.parentNode.insertBefore(s, t);
  }
})())(jQuery);
