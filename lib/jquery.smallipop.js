/*!
Smallipop (03/10/2013)
Copyright (c) 2011-2013 Small Improvements (http://www.small-improvements.com)

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.

@author Sebastian Helzle (sebastian@helzle.net)
*/

(function($) {
  var sip;
  $.smallipop = sip = {
    version: '0.5.1',
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
      tourHighlight: false,
      tourHighlightColor: '#222',
      tourHightlightFadeDuration: 200,
      tourHighlightOpacity: .5,
      tourHighlightZIndex: 9997,
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
      prev: 'Prev',
      next: 'Next',
      close: 'Close',
      of: 'of'
    },
    instances: {},
    scrollTimer: null,
    refreshQueueTimer: null,
    templates: {
      popup: '<div class="smallipop-instance">' + '<div class="sipContent"/>' + '<div class="sipArrowBorder"/>' + '<div class="sipArrow"/>' + '</div>'
    },
    tours: {},
    _hideSmallipop: function(e) {
      var direction, ignorePopupClick, ignoreTriggerClick, popup, popupData, popupId, shownId, target, trigger, triggerOptions, xDistance, yDistance, _base, _ref, _ref1, _ref2, _results;
      clearTimeout(sip.scrollTimer);
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
          sip.currentTour = null;
          if ((_ref2 = trigger.data('smallipop')) != null) {
            if (typeof (_base = _ref2.options).onTourClose === "function") {
              _base.onTourClose();
            }
          }
          this._hideTourOverlay(triggerOptions);
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
            top: "-=" + yDistance + "px",
            left: "+=" + xDistance + "px",
            opacity: 0
          }, triggerOptions.popupAnimationSpeed, triggerOptions.funcEase, function() {
            var self;
            self = $(this);
            if (!self.data('beingShown')) {
              self.css('display', 'none').data('shown', '');
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
    /*
        Queue a refresh to the popups position
    */

    _queueRefreshPosition: function(delay) {
      if (delay == null) {
        delay = 50;
      }
      clearTimeout(sip.refreshQueueTimer);
      return sip.refreshQueueTimer = setTimeout(sip._refreshPosition, delay);
    },
    /*
        Refresh the position for each visible popup
    */

    _refreshPosition: function(resetTheme) {
      var isFixed, offset, opacity, options, popup, popupCenter, popupData, popupDistanceBottom, popupDistanceLeft, popupDistanceRight, popupDistanceTop, popupH, popupId, popupOffsetLeft, popupOffsetTop, popupW, popupY, preferredPosition, selfHeight, selfWidth, selfY, shownId, trigger, triggerData, win, winHeight, winScrollLeft, winScrollTop, winWidth, windowPadding, xDistance, xOffset, xOverflow, yDistance, yOffset, yOverflow, _ref, _results;
      if (resetTheme == null) {
        resetTheme = true;
      }
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
        triggerData = trigger.data('smallipop');
        options = triggerData.options;
        popup.removeClass(function(index, classNames) {
          return ((classNames != null ? classNames.match(/sip\w+/g) : void 0) || []).join(' ');
        });
        if (resetTheme) {
          popup.attr('class', "smallipop-instance " + options.theme);
        }
        win = $(window);
        xDistance = yDistance = options.popupDistance;
        xOffset = options.popupOffset;
        yOffset = options.popupYOffset;
        isFixed = popup.data('position') === 'fixed';
        popupH = popup.outerHeight();
        popupW = popup.outerWidth();
        popupCenter = popupW / 2;
        winWidth = win.width();
        winHeight = win.height();
        winScrollTop = win.scrollTop();
        winScrollLeft = win.scrollLeft();
        windowPadding = options.windowPadding;
        offset = trigger.offset();
        selfWidth = trigger.outerWidth();
        selfHeight = trigger.outerHeight();
        selfY = offset.top - winScrollTop;
        popupOffsetLeft = offset.left + selfWidth / 2;
        popupOffsetTop = offset.top - popupH + yOffset;
        popupY = popupH + options.popupDistance - yOffset;
        popupDistanceTop = selfY - popupY;
        popupDistanceBottom = winHeight - selfY - selfHeight - popupY;
        popupDistanceLeft = offset.left - popupW - xOffset;
        popupDistanceRight = winWidth - offset.left - selfWidth - popupW;
        preferredPosition = options.preferredPosition;
        if (preferredPosition === 'left' || preferredPosition === 'right') {
          yDistance = 0;
          popupOffsetTop += selfHeight / 2 + popupH / 2;
          if ((preferredPosition === 'right' && popupDistanceRight > windowPadding) || popupDistanceLeft < windowPadding) {
            popup.addClass('sipPositionedRight');
            popupOffsetLeft = offset.left + selfWidth + xOffset;
          } else {
            popup.addClass('sipPositionedLeft');
            popupOffsetLeft = offset.left - popupW - xOffset;
            xDistance = -xDistance;
          }
        } else {
          xDistance = 0;
          if (popupOffsetLeft + popupCenter > winWidth - windowPadding) {
            popupOffsetLeft -= popupCenter * 2 - xOffset;
            popup.addClass('sipAlignLeft');
          } else if (popupOffsetLeft - popupCenter < windowPadding) {
            popupOffsetLeft -= xOffset;
            popup.addClass('sipAlignRight');
          } else {
            popupOffsetLeft -= popupCenter;
          }
          if (popupOffsetLeft < windowPadding) {
            popupOffsetLeft = windowPadding;
          }
          if ((preferredPosition === 'bottom' && popupDistanceBottom > windowPadding) || popupDistanceTop < windowPadding) {
            yDistance = -yDistance;
            popupOffsetTop += popupH + selfHeight - 2 * yOffset;
            popup.addClass('sipAlignBottom');
          }
        }
        if (popupH < selfHeight) {
          yOverflow = popupOffsetTop + popupH + windowPadding - yDistance + yOffset - winScrollTop - winHeight;
          if (yOverflow > 0) {
            popupOffsetTop = Math.max(popupOffsetTop - yOverflow - windowPadding, offset.top + yOffset + windowPadding + yDistance);
          }
        }
        if (popupW < selfWidth) {
          xOverflow = popupOffsetLeft + popupW + windowPadding + xDistance + xOffset - winScrollLeft - winWidth;
          if (xOverflow > 0) {
            popupOffsetLeft = Math.max(popupOffsetLeft - xOverflow + windowPadding, offset.left + xOffset + windowPadding - xDistance);
          }
        }
        if (options.hideTrigger) {
          trigger.stop(true).fadeTo(options.triggerAnimationSpeed, 0);
        }
        opacity = 0;
        if (!popupData.beingShown || options.cssAnimations.enabled) {
          popupOffsetTop -= yDistance;
          popupOffsetLeft += xDistance;
          xDistance = 0;
          yDistance = 0;
          opacity = 1;
        }
        if (isFixed) {
          popupOffsetLeft -= winScrollLeft;
          popupOffsetTop -= winScrollTop;
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
          top: "-=" + yDistance + "px",
          left: "+=" + xDistance + "px",
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
      var lastTrigger, lastTriggerOpt, popup, popupContent, popupPosition, shownId, tourOverlay, triggerData, triggerOptions;
      if (content == null) {
        content = '';
      }
      triggerData = trigger.data('smallipop');
      triggerOptions = triggerData.options;
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
      if (triggerOptions.tourHighlight && triggerOptions.tourIndex) {
        tourOverlay = this._getTourOverlay(triggerOptions);
        this._resetTourZIndices();
        if (trigger.css('position') === 'static') {
          trigger.css('position', 'relative');
        }
        if (!trigger.data('originalZIndex')) {
          trigger.data('originalZIndex', trigger.css('zIndex'));
        }
        trigger.css('zIndex', triggerOptions.tourHighlightZIndex + 1);
        tourOverlay.fadeTo(triggerOptions.tourHightlightFadeDuration, triggerOptions.tourHighlightOpacity);
      } else {
        this._hideTourOverlay(triggerOptions);
      }
      popupContent = content || triggerData.hint;
      if (triggerOptions.referencedContent && !content) {
        popupContent = $(triggerOptions.referencedContent).clone(true, true) || popupContent;
      }
      popupPosition = this._isElementFixed(trigger) ? 'fixed' : 'absolute';
      if (shownId !== triggerData.id) {
        popup.hide(0);
      }
      popup.data({
        beingShown: true,
        shown: triggerData.id,
        position: popupPosition
      }).find('.sipContent').empty().append(popupContent);
      popup.css('position', popupPosition);
      return sip._queueRefreshPosition(0);
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
      var _this = this;
      clearTimeout(sip.scrollTimer);
      return sip.scrollTimer = setTimeout(function() {
        return sip._refreshPosition(false);
      }, 250);
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
    _runTour: function(trigger, step) {
      var currentTourItems, i, tourTitle, triggerData, _i, _ref;
      triggerData = trigger.data('smallipop');
      tourTitle = triggerData != null ? triggerData.tourTitle : void 0;
      if (!(tourTitle && sip.tours[tourTitle])) {
        return;
      }
      sip.tours[tourTitle].sort(function(a, b) {
        return a.index - b.index;
      });
      if (!(typeof step === 'number' && step % 1 === 0)) {
        step = 0;
      } else {
        step -= 1;
      }
      sip.currentTour = tourTitle;
      currentTourItems = sip.tours[tourTitle];
      for (i = _i = 0, _ref = currentTourItems.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (i === step || currentTourItems[i].id === triggerData.id) {
          return sip._tourShow(tourTitle, i);
        }
      }
    },
    _tourShow: function(title, index) {
      var $content, closeButton, closeIcon, currentTourItems, nextButton, prevButton, trigger, triggerData;
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
      $content = $($.trim("        <div class=\"smallipop-tour-content\"></div>        " + closeIcon + "        <div class=\"smallipop-tour-footer\">          <div class=\"smallipop-tour-progress\">            " + (index + 1) + " " + sip.labels.of + " " + currentTourItems.length + "          </div>          " + prevButton + "          " + nextButton + "          " + closeButton + "        </div>"));
      $content.eq(0).append(triggerData.hint);
      sip._killTimers(triggerData.popupInstance);
      triggerData.popupInstance.data('triggerHovered', true);
      return sip._showWhenVisible(trigger, $content);
    },
    _getTourOverlay: function(options) {
      var overlay;
      overlay = $('#smallipop-tour-overlay');
      if (!overlay.length) {
        overlay = $('<div id="smallipop-tour-overlay"/>').appendTo($('body')).fadeOut(0);
      }
      return overlay.css({
        backgroundColor: options.tourHighlightColor,
        zIndex: options.tourHighlightZIndex
      });
    },
    _hideTourOverlay: function(options) {
      $('#smallipop-tour-overlay').fadeOut(options.tourHightlightFadeDuration);
      return this._resetTourZIndices();
    },
    _resetTourZIndices: function() {
      var step, steps, tour, tourTrigger, _ref, _results;
      _ref = sip.tours;
      _results = [];
      for (tour in _ref) {
        steps = _ref[tour];
        _results.push((function() {
          var _i, _len, _results1;
          _results1 = [];
          for (_i = 0, _len = steps.length; _i < _len; _i++) {
            step = steps[_i];
            tourTrigger = step.trigger;
            if (tourTrigger.data('originalZIndex')) {
              _results1.push(tourTrigger.css('zIndex', tourTrigger.data('originalZIndex')));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        })());
      }
      return _results;
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
          'resize.smallipop': sip._queueRefreshPosition,
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
          sip._runTour(this.first(), hint);
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
      var $objInfo, isFormElement, newId, objHint, option, optionName, self, tagName, tourTitle, triggerData, triggerEvents, triggerOptions, triggerPopupInstance, type, value;
      self = $(this);
      tagName = self[0].tagName.toLowerCase();
      type = self.attr('type');
      triggerData = self.data();
      objHint = hint || self.attr('title');
      $objInfo = $("." + options.infoClass, self);
      if ($objInfo.length) {
        objHint = $objInfo.clone(true, true).removeClass("" + options.infoClass);
      }
      if (objHint && !self.hasClass('sipInitialized')) {
        newId = sip.lastId++;
        triggerEvents = {};
        triggerPopupInstance = popup;
        triggerOptions = $.extend(true, {}, options);
        if (typeof triggerData['smallipop'] === 'object') {
          $.extend(true, triggerOptions, triggerData['smallipop']);
        }
        for (option in triggerData) {
          value = triggerData[option];
          if (!(option.indexOf('smallipop') >= 0)) {
            continue;
          }
          optionName = option.replace('smallipop', '');
          if (optionName) {
            optionName = optionName.substr(0, 1).toLowerCase() + optionName.substr(1);
            triggerOptions[optionName] = value;
          }
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
