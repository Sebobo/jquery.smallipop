/*!
Smallipop (02/09/2013)
Copyright (c) 2011-2013 Small Improvements (http://www.small-improvements.com)

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.

@author Sebastian Helzle (sebastian@helzle.net)
*/

(function($) {
  var sip;
  $.smallipop = sip = {
    version: '0.4.1',
    defaults: {
      autoscrollPadding: 200,
      contentAnimationSpeed: 150,
      cssAnimations: {
        enabled: false,
        show: 'animated fadeIn',
        hide: 'animated fadeOut'
      },
      funcEase: 'easeInOutQuad',
      handleInputs: true,
      hideDelay: 500,
      hideTrigger: false,
      hideOnPopupClick: true,
      hideOnTriggerClick: true,
      infoClass: 'smallipopHint',
      invertAnimation: false,
      popupOffset: 31,
      popupYOffset: 0,
      popupDistance: 20,
      popupDelay: 100,
      popupAnimationSpeed: 200,
      preferredPosition: 'top',
      referencedSelector: null,
      theme: 'default',
      touchSupport: true,
      triggerAnimationSpeed: 150,
      triggerOnClick: false,
      onAfterHide: null,
      onAfterShow: null,
      onBeforeHide: null,
      onBeforeShow: null,
      onTourClose: null,
      onTourNext: null,
      onTourPrev: null,
      windowPadding: 30
    },
    currentTour: null,
    lastId: 1,
    nextInstanceId: 1,
    lastScrollCheck: 0,
    labels: {
      prev: 'Back',
      next: 'Next',
      close: 'Close',
      of: 'of'
    },
    instances: {},
    scrollTimer: null,
    templates: {
      popup: $.trim('\
        <div class="smallipop-instance">\
          <div class="sipContent"/>\
          <div class="sipArrowBorder"/>\
          <div class="sipArrow"/>\
        </div>')
    },
    tours: {},
    _hideSmallipop: function(e) {
      var direction, ignorePopupClick, ignoreTriggerClick, popup, popupData, popupId, shownId, target, trigger, triggerOptions, xDistance, yDistance, _base, _ref, _ref1, _ref2, _results;
      target = (e != null ? e.target : void 0) ? $(e.target) : e;
      _ref = sip.instances;
      _results = [];
      for (popupId in _ref) {
        popup = _ref[popupId];
        popupData = popup.data();
        if (!(shownId = popupData.shown)) {
          continue;
        }
        if (popupData.isTour && !popup.is(target)) {
          continue;
        }
        trigger = $(".smallipop" + shownId);
        triggerOptions = ((_ref1 = trigger.data('smallipop')) != null ? _ref1.options : void 0) || sip.defaults;
        if (popupData.isTour) {
          if ((_ref2 = trigger.data('smallipop')) != null) {
            if (typeof (_base = _ref2.options).onTourClose === "function") {
              _base.onTourClose();
            }
          }
        }
        ignoreTriggerClick = !triggerOptions.hideOnTriggerClick && target.is(trigger);
        ignorePopupClick = !triggerOptions.hideOnPopupClick && popup.find(target).length;
        if (target && trigger.length && (e != null ? e.type : void 0) === 'click' && (ignoreTriggerClick || ignorePopupClick)) {
          continue;
        }
        if (shownId && triggerOptions.hideTrigger) {
          trigger.stop(true).fadeTo(triggerOptions.triggerAnimationSpeed, 1);
        }
        popup.data({
          hideDelayTimer: null,
          beingShown: false
        });
        if (triggerOptions.cssAnimations.enabled) {
          popup.removeClass(triggerOptions.cssAnimations.show).addClass(triggerOptions.cssAnimations.hide).data('shown', '');
          if (triggerOptions.onAfterHide) {
            _results.push(window.setTimeout(triggerOptions.onAfterHide, triggerOptions.popupAnimationSpeed));
          } else {
            _results.push(void 0);
          }
        } else {
          direction = triggerOptions.invertAnimation ? -1 : 1;
          xDistance = popupData.xDistance * direction;
          yDistance = popupData.yDistance * direction;
          _results.push(popup.stop(true).animate({
            top: "-=" + xDistance + "px",
            left: "+=" + yDistance + "px",
            opacity: 0
          }, triggerOptions.popupAnimationSpeed, triggerOptions.funcEase, function() {
            var tip;
            tip = $(this);
            if (!tip.data('beingShown')) {
              tip.css('display', 'none').data('shown', '');
            }
            return typeof triggerOptions.onAfterHide === "function" ? triggerOptions.onAfterHide() : void 0;
          }));
        }
      }
      return _results;
    },
    _showSmallipop: function(e) {
      var triggerData, _ref;
      triggerData = $(this).data('smallipop');
      if (triggerData.popupInstance.data('shown') !== triggerData.id && ((_ref = !triggerData.type) === 'checkbox' || _ref === 'radio')) {
        if (e != null) {
          e.preventDefault();
        }
      }
      return sip._triggerMouseover.call(this);
    },
    _onTouchDevice: function() {
      return typeof Modernizr !== "undefined" && Modernizr !== null ? Modernizr.touch : void 0;
    },
    _killTimers: function(popup) {
      clearTimeout(popup.data('hideDelayTimer'));
      return clearTimeout(popup.data('showDelayTimer'));
    },
    _refreshPosition: function() {
      var doAnimate, isFixed, offset, opacity, options, popup, popupCenter, popupData, popupDistanceBottom, popupDistanceLeft, popupDistanceRight, popupDistanceTop, popupH, popupId, popupOffsetLeft, popupOffsetTop, popupW, popupY, selfHeight, selfWidth, selfY, shownId, trigger, win, winHeight, winWidth, windowPadding, xDistance, yDistance, yOffset, _ref, _ref1, _results;
      _ref = sip.instances;
      _results = [];
      for (popupId in _ref) {
        popup = _ref[popupId];
        popupData = popup.data();
        shownId = popupData.shown;
        if (!shownId) {
          continue;
        }
        trigger = $(".smallipop" + shownId);
        options = trigger.data('smallipop').options;
        popup.removeClass(function(index, classNames) {
          return ((classNames != null ? classNames.match(/sip\w+/g) : void 0) || []).join(' ');
        });
        popup.addClass(options.theme);
        win = $(window);
        xDistance = yDistance = options.popupDistance;
        yOffset = options.popupYOffset;
        isFixed = popup.data('position') === 'fixed';
        offset = trigger.offset();
        popupH = popup.outerHeight();
        popupW = popup.outerWidth();
        popupCenter = popupW / 2;
        winWidth = win.width();
        winHeight = win.height();
        windowPadding = options.windowPadding;
        selfWidth = trigger.outerWidth();
        selfHeight = trigger.outerHeight();
        selfY = offset.top - win.scrollTop();
        popupOffsetLeft = offset.left + selfWidth / 2;
        popupOffsetTop = offset.top - popupH + yOffset;
        popupY = popupH + options.popupDistance - yOffset;
        popupDistanceTop = selfY - popupY;
        popupDistanceBottom = winHeight - selfY - selfHeight - popupY;
        popupDistanceLeft = offset.left - popupW - options.popupOffset;
        popupDistanceRight = winWidth - offset.left - selfWidth - popupW;
        if ((_ref1 = options.preferredPosition) === 'left' || _ref1 === 'right') {
          xDistance = 0;
          popupOffsetTop += selfHeight / 2 + popupH / 2;
          if ((options.preferredPosition === 'left' && popupDistanceLeft > windowPadding) || popupDistanceRight < windowPadding) {
            popup.addClass('sipPositionedLeft');
            popupOffsetLeft = offset.left - popupW - options.popupOffset;
            yDistance = -yDistance;
          } else {
            popup.addClass('sipPositionedRight');
            popupOffsetLeft = offset.left + selfWidth + options.popupOffset;
          }
        } else {
          yDistance = 0;
          if (popupOffsetLeft + popupCenter > winWidth - windowPadding) {
            popupOffsetLeft -= popupCenter * 2 - options.popupOffset;
            popup.addClass('sipAlignLeft');
          } else if (popupOffsetLeft - popupCenter < windowPadding) {
            popupOffsetLeft -= options.popupOffset;
            popup.addClass('sipAlignRight');
          } else {
            popupOffsetLeft -= popupCenter;
          }
          if ((options.preferredPosition === 'bottom' && popupDistanceBottom > windowPadding) || popupDistanceTop < windowPadding) {
            popupOffsetTop += popupH + selfHeight - 2 * yOffset;
            xDistance = -xDistance;
            yOffset = 0;
            popup.addClass('sipAlignBottom');
          }
        }
        if (options.hideTrigger) {
          trigger.stop(true).fadeTo(options.triggerAnimationSpeed, 0);
        }
        opacity = 0;
        doAnimate = popupData.beingShown && !options.cssAnimations.enabled;
        if (!doAnimate) {
          popupOffsetTop -= xDistance;
          popupOffsetLeft += yDistance;
          xDistance = 0;
          yDistance = 0;
          opacity = 1;
        }
        if (isFixed) {
          popupOffsetLeft -= win.scrollLeft();
          popupOffsetTop -= win.scrollTop();
        }
        popup.data({
          xDistance: xDistance,
          yDistance: yDistance
        }).css({
          top: popupOffsetTop,
          left: popupOffsetLeft,
          display: 'block',
          opacity: opacity
        });
        _results.push(sip._fadeInPopup(popup, {
          top: "-=" + xDistance + "px",
          left: "+=" + yDistance + "px",
          opacity: 1
        }));
      }
      return _results;
    },
    _fadeInPopup: function(popup, animationTarget) {
      var options, _ref;
      options = ((_ref = sip._getTrigger(popup.data('shown')).data('smallipop')) != null ? _ref.options : void 0) || sip.defaults;
      if (options.cssAnimations.enabled) {
        popup.addClass(options.cssAnimations.show);
        return window.setTimeout(function() {
          return sip._fadeInPopupFinished(popup, options);
        }, options.popupAnimationSpeed);
      } else {
        return popup.stop(true).animate(animationTarget, options.popupAnimationSpeed, options.funcEase, function() {
          return sip._fadeInPopupFinished(popup, options);
        });
      }
    },
    _fadeInPopupFinished: function(popup, options) {
      var popupData;
      popupData = popup.data();
      if (popupData.beingShown) {
        popup.data('beingShown', false);
        return typeof options.onAfterShow === "function" ? options.onAfterShow(sip._getTrigger(popupData.shown)) : void 0;
      }
    },
    _getTrigger: function(id) {
      return $(".smallipop" + id);
    },
    _showPopup: function(trigger, content) {
      var lastTrigger, lastTriggerOpt, popup, popupContent, shownId, triggerData;
      if (content == null) {
        content = '';
      }
      triggerData = trigger.data('smallipop');
      popup = triggerData.popupInstance;
      if (!popup.data('triggerHovered')) {
        return;
      }
      shownId = popup.data('shown');
      if (shownId) {
        lastTrigger = sip._getTrigger(shownId);
        if (lastTrigger.length) {
          lastTriggerOpt = lastTrigger.data('smallipop').options || sip.defaults;
          if (lastTriggerOpt.hideTrigger) {
            lastTrigger.stop(true).fadeTo(lastTriggerOpt.fadeSpeed, 1);
          }
        }
      }
      popupContent = content || triggerData.hint;
      if (triggerData.options.referencedContent && !content) {
        popupContent = $(triggerData.options.referencedContent).html() || popupContent;
      }
      popup.data({
        beingShown: true,
        shown: triggerData.id
      }).find('.sipContent').html(popupContent);
      popup.data('position', '').css('position', 'absolute');
      if (this._isElementFixed(trigger)) {
        popup.data('position', 'fixed').css('position', 'fixed');
      }
      if (triggerData.id !== shownId) {
        popup.attr('class', 'smallipop-instance');
      }
      return sip._refreshPosition();
    },
    _isElementFixed: function(element) {
      var elemToCheck;
      elemToCheck = element;
      while (elemToCheck.length && elemToCheck[0].nodeName !== 'HTML') {
        if (elemToCheck.css('position') === 'fixed') {
          return true;
        }
        elemToCheck = elemToCheck.parent();
      }
      return false;
    },
    _triggerMouseover: function() {
      var isTrigger, popup, shownId, trigger, triggerData, _base;
      trigger = popup = $(this);
      isTrigger = trigger.hasClass('sipInitialized');
      if (!isTrigger) {
        trigger = sip._getTrigger(popup.data('shown'));
      }
      if (!trigger.length) {
        return;
      }
      triggerData = trigger.data('smallipop');
      popup = triggerData.popupInstance.data((isTrigger ? 'triggerHovered' : 'hovered'), true);
      sip._killTimers(popup);
      shownId = popup.data('shown');
      if (shownId !== triggerData.id || popup.css('opacity') === 0) {
        if (typeof (_base = triggerData.options).onBeforeShow === "function") {
          _base.onBeforeShow(trigger);
        }
        return popup.data('showDelayTimer', setTimeout(function() {
          return sip._showPopup(trigger);
        }, triggerData.options.popupDelay));
      }
    },
    _triggerMouseout: function() {
      var isTrigger, popup, popupData, trigger, triggerData, _base;
      trigger = popup = $(this);
      isTrigger = trigger.hasClass('sipInitialized');
      if (!isTrigger) {
        trigger = sip._getTrigger(popup.data('shown'));
      }
      if (!trigger.length) {
        return;
      }
      triggerData = trigger.data('smallipop');
      popup = triggerData.popupInstance.data((isTrigger ? 'triggerHovered' : 'hovered'), false);
      sip._killTimers(popup);
      popupData = popup.data();
      if (!(popupData.hovered || popupData.triggerHovered)) {
        if (typeof (_base = triggerData.options).onBeforeHide === "function") {
          _base.onBeforeHide(trigger);
        }
        return popup.data('hideDelayTimer', setTimeout(function() {
          return sip._hideSmallipop(popup);
        }, triggerData.options.hideDelay));
      }
    },
    _onWindowScroll: function(e) {
      clearTimeout(sip.scrollTimer);
      return sip.scrollTimer = setTimeout(sip._refreshPosition, 250);
    },
    setContent: function(trigger, content) {
      var partOfTour, popupContent, triggerData;
      if (!(trigger != null ? trigger.length : void 0)) {
        return;
      }
      triggerData = trigger.data('smallipop');
      partOfTour = triggerData.tourTitle;
      if (partOfTour) {
        popupContent = triggerData.popupInstance.find('.smallipop-tour-content');
      } else {
        popupContent = triggerData.popupInstance.find('.sipContent');
      }
      if (popupContent.html() !== content) {
        return popupContent.stop(true).fadeTo(triggerData.options.contentAnimationSpeed, 0, function() {
          $(this).html(content).fadeTo(triggerData.options.contentAnimationSpeed, 1);
          return sip._refreshPosition();
        });
      }
    },
    _runTour: function(trigger) {
      var currentTourItems, i, tourTitle, triggerData, _i, _ref;
      triggerData = trigger.data('smallipop');
      tourTitle = triggerData != null ? triggerData.tourTitle : void 0;
      if (!(tourTitle && sip.tours[tourTitle])) {
        return;
      }
      sip.tours[tourTitle].sort(function(a, b) {
        return a.index - b.index;
      });
      sip.currentTour = tourTitle;
      currentTourItems = sip.tours[tourTitle];
      for (i = _i = 0, _ref = currentTourItems.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (currentTourItems[i].id === triggerData.id) {
          return sip._tourShow(tourTitle, i);
        }
      }
    },
    _tourShow: function(title, index) {
      var closeButton, closeIcon, content, currentTourItems, nextButton, prevButton, trigger, triggerData;
      currentTourItems = sip.tours[title];
      if (!currentTourItems) {
        return;
      }
      trigger = currentTourItems[index].trigger;
      triggerData = trigger.data('smallipop');
      prevButton = index > 0 ? "<a href=\"#\" class=\"smallipop-tour-prev\">" + sip.labels.prev + "</a>" : '';
      nextButton = index < currentTourItems.length - 1 ? "<a href=\"#\" class=\"smallipop-tour-next\">" + sip.labels.next + "</a>" : '';
      closeButton = index === currentTourItems.length - 1 ? "<a href=\"#\" class=\"smallipop-tour-close\">" + sip.labels.close + "</a>" : '';
      closeIcon = "<a href=\"#\" class=\"smallipop-tour-close-icon\">&Chi;</a>";
      content = "        <div class=\"smallipop-tour-content\">" + triggerData.hint + "</div>        " + closeIcon + "        <div class=\"smallipop-tour-footer\">          <div class=\"smallipop-tour-progress\">            " + (index + 1) + " " + sip.labels.of + " " + currentTourItems.length + "          </div>          " + prevButton + "          " + nextButton + "          " + closeButton + "          <br style=\"clear:both;\"/>        </div>";
      sip._killTimers(triggerData.popupInstance);
      triggerData.popupInstance.data('triggerHovered', true);
      return sip._showWhenVisible(trigger, content);
    },
    _showWhenVisible: function(trigger, content) {
      var offset, targetPosition, triggerOptions, windowHeight;
      targetPosition = trigger.offset().top;
      offset = targetPosition - $(document).scrollTop();
      windowHeight = $(window).height();
      triggerOptions = trigger.data('smallipop').options;
      if (!this._isElementFixed(trigger) && (offset < triggerOptions.autoscrollPadding || offset > windowHeight - triggerOptions.autoscrollPadding)) {
        return $('html, body').animate({
          scrollTop: targetPosition - windowHeight / 2
        }, 800, 'swing', function() {
          return sip._showPopup(trigger, content);
        });
      } else {
        return sip._showPopup(trigger, content);
      }
    },
    _tourNext: function(e) {
      var currentTourItems, i, popup, shownId, _base, _i, _ref, _ref1;
      if (e != null) {
        e.preventDefault();
      }
      currentTourItems = sip.tours[sip.currentTour];
      if (!currentTourItems) {
        return;
      }
      popup = currentTourItems[0].popupInstance;
      shownId = popup.data('shown') || currentTourItems[0].id;
      for (i = _i = 0, _ref = currentTourItems.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (!(currentTourItems[i].id === shownId)) {
          continue;
        }
        if ((_ref1 = currentTourItems[i].trigger.data('smallipop')) != null) {
          if (typeof (_base = _ref1.options).onTourNext === "function") {
            _base.onTourNext(currentTourItems[i + 1].trigger);
          }
        }
        return sip._tourShow(sip.currentTour, i + 1);
      }
    },
    _tourPrev: function(e) {
      var currentTourItems, i, popup, shownId, _base, _i, _ref, _ref1;
      if (e != null) {
        e.preventDefault();
      }
      currentTourItems = sip.tours[sip.currentTour];
      if (!currentTourItems) {
        return;
      }
      popup = currentTourItems[0].popupInstance;
      shownId = popup.data('shown') || currentTourItems[0].id;
      for (i = _i = 1, _ref = currentTourItems.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        if (!(currentTourItems[i].id === shownId)) {
          continue;
        }
        if ((_ref1 = currentTourItems[i].trigger.data('smallipop')) != null) {
          if (typeof (_base = _ref1.options).onTourPrev === "function") {
            _base.onTourPrev(currentTourItems[i - 1].trigger);
          }
        }
        return sip._tourShow(sip.currentTour, i - 1);
      }
    },
    _tourClose: function(e) {
      var popup;
      if (e != null) {
        e.preventDefault();
      }
      popup = $(e.target).closest('.smallipop-instance');
      return sip._hideSmallipop(popup);
    },
    _destroy: function(instances) {
      return instances.each(function() {
        var data, self;
        self = $(this);
        data = self.data('smallipop');
        if (data) {
          return self.unbind('.smallipop').data('smallipop', {}).removeClass("smallipop sipInitialized smallipop" + data.id + " " + data.options.theme);
        }
      });
    },
    _onWindowKeyUp: function(e) {
      var popup, popupId, targetIsInput, _ref, _ref1, _results;
      targetIsInput = (_ref = e != null ? e.target.tagName.toLowerCase() : void 0) === 'input' || _ref === 'textarea';
      switch (e.which) {
        case 27:
          _ref1 = sip.instances;
          _results = [];
          for (popupId in _ref1) {
            popup = _ref1[popupId];
            _results.push(sip._hideSmallipop(popup));
          }
          return _results;
          break;
        case 37:
          if (!targetIsInput) {
            return sip._tourPrev();
          }
          break;
        case 39:
          if (!targetIsInput) {
            return sip._tourNext();
          }
      }
    },
    _getInstance: function(id, isTour) {
      var instance;
      if (id == null) {
        id = 'default';
      }
      if (isTour == null) {
        isTour = false;
      }
      if (sip.instances[id]) {
        return sip.instances[id];
      }
      instance = $(sip.templates.popup).css('opacity', 0).attr('id', "smallipop" + (sip.nextInstanceId++)).addClass('smallipop-instance').data({
        xDistance: 0,
        yDistance: 0,
        isTour: isTour
      }).bind({
        'mouseover.smallipop': sip._triggerMouseover,
        'mouseout.smallipop': sip._triggerMouseout
      });
      $('body').append(instance);
      if (isTour) {
        instance.delegate('.smallipop-tour-prev', 'click.smallipop', sip._tourPrev).delegate('.smallipop-tour-next', 'click.smallipop', sip._tourNext).delegate('.smallipop-tour-close, .smallipop-tour-close-icon', 'click.smallipop', sip._tourClose);
      } else {
        instance.delegate('a', 'click.smallipop', sip._hideSmallipop);
      }
      if (sip.nextInstanceId === 2) {
        $(document).bind('click.smallipop touchend.smallipop', sip._hideSmallipop);
        $(window).bind({
          'resize.smallipop': sip._refreshPosition,
          'scroll.smallipop': sip._onWindowScroll,
          'keyup': sip._onWindowKeyUp
        });
      }
      return sip.instances[id] = instance;
    }
  };
  /* Add default easing function for smallipop to jQuery if missing
  */

  if (!$.easing.easeInOutQuad) {
    $.easing.easeInOutQuad = function(x, t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b;
      } else {
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
      }
    };
  }
  return $.fn.smallipop = function(options, hint) {
    var popup;
    if (options == null) {
      options = {};
    }
    if (hint == null) {
      hint = '';
    }
    if (typeof options === 'string') {
      switch (options.toLowerCase()) {
        case 'show':
          sip._showSmallipop.call(this.first().get(0));
          break;
        case 'hide':
          sip._hideSmallipop(this.first().get(0));
          break;
        case 'destroy':
          sip._destroy(this);
          break;
        case 'tour':
          sip._runTour(this.first());
          break;
        case 'update':
          sip.setContent(this.first(), hint);
      }
      return this;
    }
    options = $.extend({}, sip.defaults, options);
    if ((typeof Modernizr !== "undefined" && Modernizr !== null ? Modernizr.cssanimations : void 0) === false) {
      options.cssAnimations.enabled = false;
    }
    popup = sip._getInstance();
    return this.each(function() {
      var isFormElement, newId, objHint, option, optionName, self, tagName, tourTitle, triggerData, triggerEvents, triggerOptions, triggerPopupInstance, type, value;
      self = $(this);
      tagName = self[0].tagName.toLowerCase();
      type = self.attr('type');
      triggerData = self.data();
      objHint = hint || self.find("." + options.infoClass).html() || self.attr('title');
      if (objHint && !self.hasClass('sipInitialized')) {
        newId = sip.lastId++;
        triggerEvents = {};
        triggerPopupInstance = popup;
        triggerOptions = $.extend(true, {}, options);
        for (option in triggerData) {
          value = triggerData[option];
          if (!(option.indexOf('smallipop') >= 0)) {
            continue;
          }
          optionName = option.replace('smallipop', '');
          optionName = optionName.substr(0, 1).toLowerCase() + optionName.substr(1);
          triggerOptions[optionName] = value;
        }
        isFormElement = triggerOptions.handleInputs && (tagName === 'input' || tagName === 'select' || tagName === 'textarea');
        if (isFormElement) {
          triggerOptions.hideOnTriggerClick = false;
          triggerEvents['focus.smallipop'] = sip._triggerMouseover;
          triggerEvents['blur.smallipop'] = sip._triggerMouseout;
        } else {
          triggerEvents['mouseout.smallipop'] = sip._triggerMouseout;
        }
        if (triggerOptions.triggerOnClick || (triggerOptions.touchSupport && sip._onTouchDevice())) {
          triggerEvents['click.smallipop'] = sip._showSmallipop;
        } else {
          triggerEvents['click.smallipop'] = sip._triggerMouseout;
          triggerEvents['mouseover.smallipop'] = sip._triggerMouseover;
        }
        if (triggerOptions.tourIndex) {
          tourTitle = triggerOptions.tourTitle || 'defaultTour';
          triggerEvents = {};
          triggerOptions.hideOnTriggerClick = false;
          triggerOptions.hideOnPopupClick = false;
          triggerPopupInstance = sip._getInstance(tourTitle, true);
          if (!sip.tours[tourTitle]) {
            sip.tours[tourTitle] = [];
          }
          sip.tours[tourTitle].push({
            index: triggerOptions.tourIndex || 0,
            id: newId,
            trigger: self,
            popupInstance: triggerPopupInstance
          });
        }
        self.addClass("sipInitialized smallipop" + newId).attr('title', '').data('smallipop', {
          id: newId,
          hint: objHint,
          options: triggerOptions,
          tagName: tagName,
          type: type,
          tourTitle: tourTitle,
          popupInstance: triggerPopupInstance
        }).bind(triggerEvents);
        if (!triggerOptions.hideOnTriggerClick) {
          return self.delegate('a', 'click.smallipop', sip._hideSmallipop);
        }
      }
    });
  };
})(jQuery);
