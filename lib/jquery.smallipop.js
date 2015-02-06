
/*!
Smallipop (01/17/2015)
Copyright (c) 2011-2015 Small Improvements (http://www.small-improvements.com)

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.

@author Sebastian Helzle (sebastian@helzle.net)
 */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    return define(['jquery'], factory);
  } else {
    return factory(jQuery);
  }
})(function($) {
  var $document, $overlay, $window, classAlignLeft, classAlignRight, classBase, classBottom, classContent, classHint, classInitialized, classInstance, classLeft, classRight, classTheme, classTour, classTourClose, classTourCloseIcon, classTourContent, classTourFooter, classTourNext, classTourOverlay, classTourPrev, classTourProgress, cssAnimationsEnabled, currentTour, dataBeingShown, dataIsTour, dataPopupHovered, dataPosition, dataShown, dataTimerHide, dataTimerShow, dataTriggerHovered, dataXDistance, dataYDistance, dataZIndex, destroy, eventBlur, eventClick, eventFocus, eventKeyUp, eventMouseOut, eventMouseOver, eventResize, eventScroll, eventTouchEnd, fadeInPopup, fadeInPopupFinished, filterAlignmentClass, filterBaseClass, filterClass, forceRefreshPosition, getInstance, getOverlay, getTrigger, hideSmallipop, hideTourOverlay, instances, isElementFixed, killTimers, lastId, lastScrollCheck, nextInstanceId, onWindowKeyUp, onWindowScroll, popupTemplate, queueRefreshPosition, reAlignmentClass, reBaseClass, refreshPosition, refreshQueueTimer, resetTourZIndices, runTour, scrollTimer, setContent, showPopup, showSmallipop, showWhenVisible, sip, touchEnabled, tourClose, tourNext, tourPrev, tourShow, tours, triggerMouseout, triggerMouseover;
  classBase = 'smallipop';
  classHint = classBase + '-hint';
  classInstance = classBase + '-instance';
  classContent = classBase + '-content';
  classLeft = classBase + '-left';
  classRight = classBase + '-right';
  classBottom = classBase + '-bottom';
  classAlignLeft = classBase + '-align-left';
  classAlignRight = classBase + '-align-right';
  classInitialized = classBase + '-initialized';
  classTheme = classBase + '-theme-';
  classTour = classBase + '-tour';
  classTourContent = classTour + '-content';
  classTourOverlay = classTour + '-overlay';
  classTourFooter = classTour + '-footer';
  classTourCloseIcon = classTour + '-close-icon';
  classTourProgress = classTour + '-progress';
  classTourClose = classTour + '-close';
  classTourPrev = classTour + '-prev';
  classTourNext = classTour + '-next';
  eventFocus = 'focus.' + classBase;
  eventClick = 'click.' + classBase;
  eventBlur = 'blur.' + classBase;
  eventMouseOut = 'mouseout.' + classBase;
  eventMouseOver = 'mouseover.' + classBase;
  eventTouchEnd = 'touchend.' + classBase;
  eventResize = 'resize.' + classBase;
  eventScroll = 'scroll.' + classBase;
  eventKeyUp = 'keyup.' + classBase;
  dataZIndex = classBase + 'OriginalZIndex';
  dataBeingShown = classBase + 'BeingShown';
  dataTimerHide = classBase + 'HideDelayTimer';
  dataTimerShow = classBase + 'ShowDelayTimer';
  dataTriggerHovered = classBase + 'TriggerHovered';
  dataPopupHovered = classBase + 'PopupHovered';
  dataShown = classBase + 'Shown';
  dataPosition = classBase + 'Position';
  dataXDistance = classBase + 'XDistance';
  dataYDistance = classBase + 'YDistance';
  dataIsTour = classBase + 'IsTour';
  reAlignmentClass = new RegExp(classBase + '-(align|bottom)\w*', "g");
  reBaseClass = new RegExp(classBase + '\w+', "g");
  $document = $(document);
  $window = $(window);
  $overlay = null;
  instances = {};
  tours = {};
  currentTour = null;
  lastId = 1;
  nextInstanceId = 1;
  scrollTimer = null;
  lastScrollCheck = 0;
  refreshQueueTimer = null;
  popupTemplate = "<div class='" + classInstance + "'><div class='" + classContent + "'/></div>";
  $.smallipop = sip = {
    version: '0.6.2',
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
      infoClass: classHint,
      invertAnimation: false,
      popupId: '',
      popupOffset: 31,
      popupYOffset: 0,
      popupDistance: 20,
      popupDelay: 100,
      popupAnimationSpeed: 200,
      preferredPosition: 'top',
      referencedContent: null,
      theme: 'default',
      touchSupport: true,
      tourHighlight: false,
      tourHighlightColor: '#222',
      tourHighlightFadeDuration: 200,
      tourHighlightOpacity: .5,
      tourHighlightZIndex: 9997,
      tourNavigationEnabled: true,
      triggerAnimationSpeed: 150,
      triggerOnClick: false,
      onAfterHide: null,
      onAfterShow: null,
      onBeforeHide: null,
      onBeforeShow: null,
      onTourClose: null,
      onTourNext: null,
      onTourPrev: null,
      windowPadding: 30,
      labels: {
        prev: 'Prev',
        next: 'Next',
        close: 'Close',
        of: 'of'
      }
    }
  };
  if (!$.easing.easeInOutQuad) {
    $.easing.easeInOutQuad = function(x, t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b;
      } else {
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
      }
    };
  }
  resetTourZIndices = function() {
    var step, steps, tour, tourTrigger, _results;
    _results = [];
    for (tour in tours) {
      steps = tours[tour];
      _results.push((function() {
        var _i, _len, _results1;
        _results1 = [];
        for (_i = 0, _len = steps.length; _i < _len; _i++) {
          step = steps[_i];
          tourTrigger = step.trigger;
          if (tourTrigger.data(dataZIndex)) {
            _results1.push(tourTrigger.css('zIndex', tourTrigger.data(dataZIndex)));
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      })());
    }
    return _results;
  };
  touchEnabled = typeof Modernizr !== "undefined" && Modernizr !== null ? Modernizr.touch : void 0;
  cssAnimationsEnabled = typeof Modernizr !== "undefined" && Modernizr !== null ? Modernizr.cssanimations : void 0;
  getTrigger = function(id) {
    return $("." + (classBase + id));
  };
  getOverlay = function() {
    if (!$overlay) {
      $overlay = $("<div id='" + classTourOverlay + "'/>").appendTo($('body')).fadeOut(0);
    }
    return $overlay;
  };
  hideTourOverlay = function(options) {
    getOverlay().fadeOut(options.tourHighlightFadeDuration);
    return resetTourZIndices();
  };
  hideSmallipop = function(e) {
    var direction, ignorePopupClick, ignoreTriggerClick, popup, popupData, popupId, shownId, target, trigger, triggerData, triggerIsTarget, triggerOptions, xDistance, yDistance, _base, _ref, _ref1, _results;
    clearTimeout(scrollTimer);
    target = (e != null ? e.target : void 0) ? $(e.target) : e;
    _results = [];
    for (popupId in instances) {
      popup = instances[popupId];
      popupData = popup.data();
      if (!(shownId = popupData[dataShown])) {
        continue;
      }
      trigger = getTrigger(shownId);
      triggerIsTarget = trigger.is(target);
      triggerData = trigger.data(classBase);
      triggerOptions = triggerData.options || sip.defaults;
      if ((popupData[dataIsTour] || triggerData.isFormElement) && !popup.is(target) && !(triggerIsTarget && popup.is(triggerOptions.popupInstance))) {
        continue;
      }
      if (popupData[dataIsTour]) {
        currentTour = null;
        if ((_ref = trigger.data(classBase)) != null) {
          if (typeof (_base = _ref.options).onTourClose === "function") {
            _base.onTourClose();
          }
        }
        hideTourOverlay(triggerOptions);
      }
      ignoreTriggerClick = !triggerOptions.hideOnTriggerClick && triggerIsTarget;
      ignorePopupClick = !triggerOptions.hideOnPopupClick && popup.find(target).length;
      if (target && trigger.length && ((_ref1 = e != null ? e.type : void 0) === 'click' || _ref1 === 'touchend') && (ignoreTriggerClick || ignorePopupClick)) {
        continue;
      }
      if (shownId && triggerOptions.hideTrigger) {
        trigger.stop(true).fadeTo(triggerOptions.triggerAnimationSpeed, 1);
      }
      popup.data(dataTimerHide, null).data(dataBeingShown, false);
      if (triggerOptions.cssAnimations.enabled) {
        popup.removeClass(triggerOptions.cssAnimations.show).addClass(triggerOptions.cssAnimations.hide).data(dataShown, '');
        if (triggerOptions.onAfterHide) {
          _results.push(window.setTimeout(triggerOptions.onAfterHide, triggerOptions.popupAnimationSpeed));
        } else {
          _results.push(void 0);
        }
      } else {
        direction = triggerOptions.invertAnimation ? -1 : 1;
        xDistance = popupData[dataXDistance] * direction;
        yDistance = popupData[dataYDistance] * direction;
        _results.push(popup.stop(true).animate({
          top: "-=" + yDistance,
          left: "+=" + xDistance,
          opacity: 0
        }, triggerOptions.popupAnimationSpeed, triggerOptions.funcEase, function() {
          var self;
          self = $(this);
          if (!self.data(dataBeingShown)) {
            self.css('display', 'none').data(dataShown, '');
          }
          return typeof triggerOptions.onAfterHide === "function" ? triggerOptions.onAfterHide() : void 0;
        }));
      }
    }
    return _results;
  };
  showSmallipop = function(e) {
    var triggerData, _ref;
    triggerData = $(this).data(classBase);
    if (!triggerData) {
      return;
    }
    if (triggerData.popupInstance.data(dataShown) !== triggerData.id && ((_ref = !triggerData.type) === 'checkbox' || _ref === 'radio')) {
      if (e != null) {
        e.preventDefault();
      }
    }
    return triggerMouseover.call(this);
  };
  killTimers = function(popup) {
    clearTimeout(popup.data(dataTimerHide));
    return clearTimeout(popup.data(dataTimerShow));
  };
  queueRefreshPosition = function(delay) {
    if (delay == null) {
      delay = 50;
    }
    clearTimeout(refreshQueueTimer);
    return refreshQueueTimer = setTimeout(refreshPosition, delay);
  };
  filterClass = function(classStr, re) {
    if (classStr) {
      return (classStr.match(re) || []).join(' ');
    }
  };
  filterAlignmentClass = function(idx, classStr) {
    return filterClass(classStr, reAlignmentClass);
  };
  filterBaseClass = function(idx, classStr) {
    return filterClass(classStr, reBaseClass);
  };
  refreshPosition = function(resetTheme) {
    var isFixed, offset, opacity, options, popup, popupCenter, popupData, popupDistanceBottom, popupDistanceLeft, popupDistanceRight, popupDistanceTop, popupH, popupId, popupOffsetLeft, popupOffsetTop, popupW, popupY, preferredPosition, selfHeight, selfWidth, selfY, shownId, themes, trigger, triggerData, win, winHeight, winScrollLeft, winScrollTop, winWidth, windowPadding, xDistance, xOffset, xOverflow, yDistance, yOffset, yOverflow, _results;
    if (resetTheme == null) {
      resetTheme = true;
    }
    _results = [];
    for (popupId in instances) {
      popup = instances[popupId];
      popupData = popup.data();
      shownId = popupData[dataShown];
      if (!shownId) {
        continue;
      }
      trigger = getTrigger(shownId);
      triggerData = trigger.data(classBase);
      options = triggerData.options;
      popup.removeClass(filterAlignmentClass);
      if (resetTheme) {
        themes = classTheme + options.theme.split(' ').join(" " + classTheme);
        popup.attr('class', "" + classInstance + " " + themes);
      }
      win = $(window);
      xDistance = yDistance = options.popupDistance;
      xOffset = options.popupOffset;
      yOffset = options.popupYOffset;
      isFixed = popup.data(dataPosition) === 'fixed';
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
          popup.addClass(classRight);
          popupOffsetLeft = offset.left + selfWidth + xOffset;
        } else {
          popup.addClass(classLeft);
          popupOffsetLeft = offset.left - popupW - xOffset;
          xDistance = -xDistance;
        }
      } else {
        xDistance = 0;
        if (popupOffsetLeft + popupCenter > winWidth - windowPadding) {
          popupOffsetLeft -= popupCenter * 2 - xOffset;
          popup.addClass(classAlignLeft);
        } else if (popupOffsetLeft - popupCenter < windowPadding) {
          popupOffsetLeft -= xOffset;
          popup.addClass(classAlignRight);
        } else {
          popupOffsetLeft -= popupCenter;
        }
        if (popupOffsetLeft < windowPadding) {
          popupOffsetLeft = windowPadding;
        }
        if ((preferredPosition === 'bottom' && popupDistanceBottom > windowPadding) || popupDistanceTop < windowPadding) {
          yDistance = -yDistance;
          popupOffsetTop += popupH + selfHeight - 2 * yOffset;
          popup.addClass(classBottom);
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
      if (!popupData[dataBeingShown] || options.cssAnimations.enabled) {
        popupOffsetTop -= yDistance;
        popupOffsetLeft += xDistance;
        xDistance = yDistance = 0;
        opacity = 1;
      }
      if (isFixed) {
        popupOffsetLeft -= winScrollLeft;
        popupOffsetTop -= winScrollTop;
      }
      popup.data(dataXDistance, xDistance).data(dataYDistance, yDistance).css({
        top: popupOffsetTop,
        left: popupOffsetLeft,
        display: 'block',
        opacity: opacity
      });
      _results.push(fadeInPopup(popup, {
        top: "-=" + yDistance,
        left: "+=" + xDistance,
        opacity: 1
      }));
    }
    return _results;
  };
  forceRefreshPosition = function() {
    return refreshPosition(false);
  };
  fadeInPopup = function(popup, animationTarget) {
    var options, _ref;
    options = ((_ref = getTrigger(popup.data(dataShown)).data(classBase)) != null ? _ref.options : void 0) || sip.defaults;
    if (options.cssAnimations.enabled) {
      popup.addClass(options.cssAnimations.show);
      return window.setTimeout(function() {
        return fadeInPopupFinished(popup, options);
      }, options.popupAnimationSpeed);
    } else {
      return popup.stop(true).animate(animationTarget, options.popupAnimationSpeed, options.funcEase, function() {
        return fadeInPopupFinished(popup, options);
      });
    }
  };
  fadeInPopupFinished = function(popup, options) {
    var popupData;
    popupData = popup.data();
    if (popupData[dataBeingShown]) {
      popup.data(dataBeingShown, false);
      return typeof options.onAfterShow === "function" ? options.onAfterShow(getTrigger(popupData[dataShown])) : void 0;
    }
  };
  showPopup = function(trigger, content) {
    var lastTrigger, lastTriggerOpt, popup, popupContent, popupPosition, shownId, tourOverlay, triggerData, triggerOptions;
    if (content == null) {
      content = '';
    }
    triggerData = trigger.data(classBase);
    triggerOptions = triggerData.options;
    popup = triggerData.popupInstance;
    if (!popup.data(dataTriggerHovered)) {
      return;
    }
    shownId = popup.data(dataShown);
    if (shownId) {
      lastTrigger = getTrigger(shownId);
      if (lastTrigger.length) {
        lastTriggerOpt = lastTrigger.data(classBase).options || sip.defaults;
        if (lastTriggerOpt.hideTrigger) {
          lastTrigger.stop(true).fadeTo(lastTriggerOpt.fadeSpeed, 1);
        }
      }
    }
    if (triggerOptions.tourHighlight && triggerOptions.tourIndex) {
      tourOverlay = getOverlay().css({
        backgroundColor: triggerOptions.tourHighlightColor,
        zIndex: triggerOptions.tourHighlightZIndex
      });
      resetTourZIndices();
      if (trigger.css('position') === 'static') {
        trigger.css('position', 'relative');
      }
      if (!trigger.data(dataZIndex)) {
        trigger.data(dataZIndex, trigger.css('zIndex'));
      }
      trigger.css('zIndex', triggerOptions.tourHighlightZIndex + 1);
      tourOverlay.fadeTo(triggerOptions.tourHighlightFadeDuration, triggerOptions.tourHighlightOpacity);
    } else if ($overlay) {
      hideTourOverlay(triggerOptions);
    }
    popupContent = content || triggerData.hint;
    if (triggerOptions.referencedContent && !content) {
      popupContent = $(triggerOptions.referencedContent).clone(true, true) || popupContent;
    }
    popupPosition = isElementFixed(trigger) ? 'fixed' : 'absolute';
    if (shownId !== triggerData.id) {
      popup.hide(0);
    }
    popup.data(dataBeingShown, true).data(dataShown, triggerData.id).data(dataPosition, popupPosition).find('.' + classContent).empty().append(popupContent);
    popup.css('position', popupPosition);
    return queueRefreshPosition(0);
  };
  isElementFixed = function(element) {
    var elemToCheck;
    elemToCheck = element;
    while (elemToCheck.length && elemToCheck[0].nodeName.toUpperCase() !== 'HTML') {
      if (elemToCheck.css('position') === 'fixed') {
        return true;
      }
      elemToCheck = elemToCheck.parent();
    }
    return false;
  };
  triggerMouseover = function() {
    var isTrigger, popup, shownId, trigger, triggerData, _base;
    trigger = popup = $(this);
    isTrigger = trigger.hasClass(classInitialized);
    if (!isTrigger) {
      trigger = getTrigger(popup.data(dataShown));
    }
    if (!trigger.length) {
      return;
    }
    triggerData = trigger.data(classBase);
    popup = triggerData.popupInstance.data((isTrigger ? dataTriggerHovered : dataPopupHovered), true);
    killTimers(popup);
    shownId = popup.data(dataShown);
    if (shownId !== triggerData.id || popup.css('opacity') === 0) {
      if (typeof (_base = triggerData.options).onBeforeShow === "function") {
        _base.onBeforeShow(trigger);
      }
      return popup.data(dataTimerShow, setTimeout(function() {
        return showPopup(trigger);
      }, triggerData.options.popupDelay));
    }
  };
  triggerMouseout = function() {
    var isTrigger, popup, popupData, trigger, triggerData, _base;
    trigger = popup = $(this);
    isTrigger = trigger.hasClass(classInitialized);
    if (!isTrigger) {
      trigger = getTrigger(popup.data(dataShown));
    }
    if (!trigger.length) {
      return;
    }
    triggerData = trigger.data(classBase);
    popup = triggerData.popupInstance.data((isTrigger ? dataTriggerHovered : dataPopupHovered), false);
    killTimers(popup);
    popupData = popup.data();
    if (!(popupData[dataPopupHovered] || popupData[dataTriggerHovered])) {
      if (typeof (_base = triggerData.options).onBeforeHide === "function") {
        _base.onBeforeHide(trigger);
      }
      return popup.data(dataTimerHide, setTimeout(function() {
        return hideSmallipop(popup);
      }, triggerData.options.hideDelay));
    }
  };
  onWindowScroll = function(e) {
    clearTimeout(scrollTimer);
    return scrollTimer = setTimeout(forceRefreshPosition, 250);
  };
  setContent = function(trigger, content) {
    var partOfTour, popupContent, triggerData;
    if (!(trigger != null ? trigger.length : void 0)) {
      return;
    }
    triggerData = trigger.data(classBase);
    partOfTour = triggerData.tourTitle;
    if (partOfTour) {
      popupContent = triggerData.popupInstance.find('.' + classTourContent);
    } else {
      popupContent = triggerData.popupInstance.find('.' + classContent);
    }
    if (popupContent.html() !== content) {
      return popupContent.stop(true).fadeTo(triggerData.options.contentAnimationSpeed, 0, function() {
        $(this).html(content).fadeTo(triggerData.options.contentAnimationSpeed, 1);
        return refreshPosition();
      });
    }
  };
  runTour = function(trigger, step) {
    var currentTourItems, i, tourTitle, triggerData, _i, _ref;
    triggerData = trigger.data(classBase);
    tourTitle = triggerData != null ? triggerData.tourTitle : void 0;
    if (!(tourTitle && tours[tourTitle])) {
      return;
    }
    tours[tourTitle].sort(function(a, b) {
      return a.index - b.index;
    });
    if (!(typeof step === 'number' && step % 1 === 0)) {
      step = -1;
    } else {
      step -= 1;
    }
    currentTour = tourTitle;
    currentTourItems = tours[tourTitle];
    for (i = _i = 0, _ref = currentTourItems.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      if ((step >= 0 && i === step) || (step < 0 && currentTourItems[i].id === triggerData.id)) {
        return tourShow(tourTitle, i);
      }
    }
  };
  tourShow = function(title, index) {
    var $content, $trigger, currentTourItems, navigation, navigationEnabled, options, triggerData;
    currentTourItems = tours[title];
    if (!currentTourItems) {
      return;
    }
    $trigger = currentTourItems[index].trigger;
    triggerData = $trigger.data(classBase);
    options = triggerData.options;
    navigationEnabled = options.tourNavigationEnabled;
    navigation = '';
    if (navigationEnabled) {
      navigation += ("<div class='" + classTourProgress + "'>") + ("" + (index + 1) + " " + options.labels.of + " " + currentTourItems.length + "</div>");
      if (index > 0) {
        navigation += "<a href='#' class='" + classTourPrev + "'>" + options.labels.prev + "</a>";
      }
      if (index < currentTourItems.length - 1) {
        navigation += "<a href='#' class='" + classTourNext + "'>" + options.labels.next + "</a>";
      }
    }
    if (!navigationEnabled || index === currentTourItems.length - 1) {
      navigation += "<a href='#' class='" + classTourClose + "'>" + options.labels.close + "</a>";
    }
    $content = $(("<div class='" + classTourContent + "'/>") + ("<a href='#' class='" + classTourCloseIcon + "'>&Chi;</a>") + ("<div class='" + classTourFooter + "'>" + navigation + "</div>"));
    $content.eq(0).append(triggerData.hint);
    killTimers(triggerData.popupInstance);
    triggerData.popupInstance.data(dataTriggerHovered, true);
    return showWhenVisible($trigger, $content);
  };
  showWhenVisible = function($trigger, content) {
    var offset, targetPosition, triggerOptions, windowHeight;
    targetPosition = $trigger.offset().top;
    offset = targetPosition - $document.scrollTop();
    windowHeight = $window.height();
    triggerOptions = $trigger.data(classBase).options;
    if (!isElementFixed($trigger) && (offset < triggerOptions.autoscrollPadding || offset > windowHeight - triggerOptions.autoscrollPadding)) {
      return $('html, body').animate({
        scrollTop: targetPosition - windowHeight / 2
      }, 800, 'swing', function() {
        return showPopup($trigger, content);
      });
    } else {
      return showPopup($trigger, content);
    }
  };
  tourNext = function(e) {
    var $popup, currentTourItems, i, shownId, triggerOptions, _i, _ref;
    if (e != null) {
      e.preventDefault();
    }
    currentTourItems = tours[currentTour];
    if (!currentTourItems) {
      return;
    }
    $popup = currentTourItems[0].popupInstance;
    shownId = $popup.data(dataShown) || currentTourItems[0].id;
    for (i = _i = 0, _ref = currentTourItems.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (!(currentTourItems[i].id === shownId)) {
        continue;
      }
      triggerOptions = currentTourItems[i].trigger.data(classBase).options;
      if (triggerOptions.tourNavigationEnabled) {
        if (typeof triggerOptions.onTourNext === "function") {
          triggerOptions.onTourNext(currentTourItems[i + 1].trigger);
        }
        return tourShow(currentTour, i + 1);
      }
    }
  };
  tourPrev = function(e) {
    var $popup, currentTourItems, i, shownId, triggerOptions, _i, _ref;
    if (e != null) {
      e.preventDefault();
    }
    currentTourItems = tours[currentTour];
    if (!currentTourItems) {
      return;
    }
    $popup = currentTourItems[0].popupInstance;
    shownId = $popup.data(dataShown) || currentTourItems[0].id;
    for (i = _i = 1, _ref = currentTourItems.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      if (!(currentTourItems[i].id === shownId)) {
        continue;
      }
      triggerOptions = currentTourItems[i].trigger.data(classBase).options;
      if (triggerOptions.tourNavigationEnabled) {
        if (typeof triggerOptions.onTourPrev === "function") {
          triggerOptions.onTourPrev(currentTourItems[i - 1].trigger);
        }
        return tourShow(currentTour, i - 1);
      }
    }
  };
  tourClose = function(e) {
    var $popup;
    if (e != null) {
      e.preventDefault();
    }
    $popup = $(e.target).closest("." + classInstance);
    return hideSmallipop($popup);
  };
  destroy = function(instances) {
    return instances.each(function() {
      var data, self;
      self = $(this);
      data = self.data(classBase);
      if (data) {
        return self.unbind("." + classBase).data(classBase, {}).removeClass(filterBaseClass);
      }
    });
  };
  onWindowKeyUp = function(e) {
    var popup, popupId, targetIsInput, _ref, _results;
    targetIsInput = (_ref = e != null ? e.target.tagName.toLowerCase() : void 0) === 'input' || _ref === 'textarea';
    switch (e.which) {
      case 27:
        _results = [];
        for (popupId in instances) {
          popup = instances[popupId];
          _results.push(hideSmallipop(popup));
        }
        return _results;
        break;
      case 37:
        if (!targetIsInput) {
          return tourPrev();
        }
        break;
      case 39:
        if (!targetIsInput) {
          return tourNext();
        }
    }
  };
  getInstance = function(id, isTour) {
    var instance;
    if (id == null) {
      id = 'default';
    }
    if (isTour == null) {
      isTour = false;
    }
    if (instances[id]) {
      return instances[id];
    }
    instance = $(popupTemplate).css('opacity', 0).attr('id', "" + (classBase + nextInstanceId++)).addClass(classInstance).data(dataXDistance, 0).data(dataYDistance, 0).data(dataIsTour, isTour).bind(eventMouseOver, triggerMouseover).bind(eventMouseOut, triggerMouseout);
    $('body').append(instance);
    if (isTour) {
      instance.delegate("." + classTourPrev, eventClick, tourPrev).delegate("." + classTourNext, eventClick, tourNext).delegate("." + classTourClose + ", ." + classTourCloseIcon, eventClick, tourClose);
    } else {
      instance.delegate('a', eventClick, hideSmallipop);
    }
    if (nextInstanceId === 2) {
      $document.bind("" + eventClick + " " + eventTouchEnd, hideSmallipop);
      $window.bind(eventResize, queueRefreshPosition).bind(eventScroll, onWindowScroll).bind(eventKeyUp, onWindowKeyUp);
    }
    return instances[id] = instance;
  };
  return $.fn.smallipop = function(options, hint) {
    var $popup;
    if (options == null) {
      options = {};
    }
    if (hint == null) {
      hint = '';
    }
    if (this.length === 0) {
      return this;
    }
    if (typeof options === 'string') {
      switch (options.toLowerCase()) {
        case 'show':
          showSmallipop.call(this.first().get(0));
          break;
        case 'hide':
          hideSmallipop(this.first().get(0));
          break;
        case 'destroy':
          destroy(this);
          break;
        case 'tour':
          runTour(this.first(), hint);
          break;
        case 'update':
          setContent(this.first(), hint);
      }
      return this;
    }
    options = $.extend(true, {}, sip.defaults, options);
    if (!cssAnimationsEnabled) {
      options.cssAnimations.enabled = false;
    }
    $popup = getInstance(options.popupId);
    return this.each(function() {
      var $objInfo, $self, isFormElement, newId, objHint, option, optionName, tagName, touchTrigger, tourTitle, triggerData, triggerEvents, triggerOptions, triggerPopupInstance, type, value;
      $self = $(this);
      tagName = $self[0].tagName.toLowerCase();
      type = $self.attr('type');
      triggerData = $self.data();
      objHint = hint || $self.attr('title');
      $objInfo = $("> ." + options.infoClass + ":first", $self);
      if ($objInfo.length) {
        objHint = $objInfo.clone(true, true).removeClass(options.infoClass);
      }
      if (objHint && !$self.hasClass(classInitialized)) {
        newId = lastId++;
        triggerEvents = {};
        triggerPopupInstance = $popup;
        triggerOptions = $.extend(true, {}, options);
        if (typeof triggerData[classBase] === 'object') {
          $.extend(true, triggerOptions, triggerData[classBase]);
        }
        for (option in triggerData) {
          value = triggerData[option];
          if (!(option.indexOf(classBase) >= 0)) {
            continue;
          }
          optionName = option.replace(classBase, '');
          if (optionName) {
            optionName = optionName.substr(0, 1).toLowerCase() + optionName.substr(1);
            triggerOptions[optionName] = value;
          }
        }
        isFormElement = triggerOptions.handleInputs && (tagName === 'input' || tagName === 'select' || tagName === 'textarea');
        if (triggerOptions.tourIndex) {
          tourTitle = triggerOptions.tourTitle || 'defaultTour';
          triggerOptions.hideOnTriggerClick = triggerOptions.hideOnPopupClick = false;
          triggerPopupInstance = getInstance(tourTitle, true);
          if (!tours[tourTitle]) {
            tours[tourTitle] = [];
          }
          tours[tourTitle].push({
            index: triggerOptions.tourIndex || 0,
            id: newId,
            trigger: $self,
            popupInstance: triggerPopupInstance
          });
        } else {
          touchTrigger = triggerOptions.touchSupport && touchEnabled;
          if (isFormElement) {
            triggerOptions.hideOnTriggerClick = false;
            triggerEvents[eventFocus] = triggerMouseover;
            triggerEvents[eventBlur] = triggerMouseout;
          } else if (!touchTrigger) {
            triggerEvents[eventMouseOut] = triggerMouseout;
          }
          if (triggerOptions.triggerOnClick || touchTrigger) {
            triggerEvents[eventClick] = showSmallipop;
          } else {
            triggerEvents[eventClick] = triggerMouseout;
            triggerEvents[eventMouseOver] = triggerMouseover;
          }
        }
        $self.addClass("" + classInitialized + " " + classBase + newId).attr('title', '').data(classBase, {
          id: newId,
          hint: objHint,
          options: triggerOptions,
          tagName: tagName,
          type: type,
          tourTitle: tourTitle,
          popupInstance: triggerPopupInstance,
          isFormElement: isFormElement
        }).bind(triggerEvents);
        if (!triggerOptions.hideOnTriggerClick) {
          return $self.delegate('a', eventClick, hideSmallipop);
        }
      }
    });
  };
});
