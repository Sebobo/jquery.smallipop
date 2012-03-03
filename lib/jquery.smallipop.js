/*!
Smallipop 0.1.6 (03/03/2012)
Copyright (c) 2011-2012 Small Improvements (http://www.small-improvements.com)

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.

@author Sebastian Helzle (sebastian@small-improvements.com)
*/
(function($) {
  $.smallipop = {
    version: '0.1.6',
    defaults: {
      popupOffset: 31,
      popupYOffset: 0,
      popupDistance: 20,
      popupDelay: 100,
      windowPadding: 30,
      hideTrigger: false,
      theme: "default",
      infoClass: "smallipopHint",
      triggerAnimationSpeed: 150,
      popupAnimationSpeed: 200,
      invertAnimation: false,
      horizontal: false,
      preferredPosition: "top",
      triggerOnClick: false,
      touchSupport: true,
      funcEase: "easeInOutQuad"
    },
    popup: null,
    lastId: 1,
    hideSmallipop: function() {
      var direction, shownId, sip, trigger, triggerOpt, xDistance, yDistance;
      sip = $.smallipop;
      shownId = sip.popup.data("shown");
      trigger = $(".smallipop" + shownId);
      triggerOpt = trigger.data("options") || sip.defaults;
      if (shownId && triggerOpt.hideTrigger) {
        trigger.stop(true).fadeTo(triggerOpt.triggerAnimationSpeed, 1);
      }
      direction = triggerOpt.invertAnimation ? -1 : 1;
      xDistance = sip.popup.data("xDistance") * direction;
      yDistance = sip.popup.data("yDistance") * direction;
      return sip.popup.data({
        hideDelayTimer: null,
        beingShown: false
      }).stop(true).animate({
        top: "-=" + xDistance + "px",
        left: "+=" + yDistance + "px",
        opacity: 0
      }, triggerOpt.popupAnimationSpeed, triggerOpt.funcEase, function() {
        var tip;
        tip = $(this);
        if (!tip.data("beingShown")) {
          return tip.css("display", "none").data("shown", "");
        }
      });
    },
    showSmallipop: function(e) {
      var sip;
      sip = $.smallipop;
      if (sip.popup.data("shown") !== $(this).data("id")) e.preventDefault();
      return sip.triggerMouseover.call(this);
    },
    onWindowClick: function(e) {
      var popup, sip;
      sip = $.smallipop;
      popup = sip.popup;
      if (!(e.target === popup[0] || $(e.target).closest(".sipInitialized").length)) {
        return sip.hideSmallipop.call(this);
      }
    },
    onTouchDevice: function() {
      return typeof Modernizr !== "undefined" && Modernizr !== null ? Modernizr.touch : void 0;
    },
    killTimers: function() {
      var hideTimer, popup, showTimer;
      popup = $.smallipop.popup;
      hideTimer = popup.data("hideDelayTimer");
      showTimer = popup.data("showDelayTimer");
      if (hideTimer) clearTimeout(hideTimer);
      if (showTimer) return clearTimeout(showTimer);
    },
    triggerMouseover: function() {
      var id, opt, popup, self, shownId, sip;
      self = $(this);
      id = self.data("id");
      sip = $.smallipop;
      popup = sip.popup;
      shownId = popup.data("shown");
      sip.killTimers();
      popup.data((id ? "triggerHovered" : "hovered"), true);
      if (id && !popup.data("beingShown") && shownId !== id) {
        opt = self.data("options");
        return popup.data("showDelayTimer", setTimeout(function() {
          var offset, popupCenter, popupH, popupOffsetLeft, popupOffsetTop, popupW, popupY, selfHeight, selfWidth, selfY, trigger, triggerOpt, win, winHeight, winWidth, windowPadding, xDistance, yDistance, yOffset;
          if (!popup.data("triggerHovered")) return;
          trigger = $(".smallipop" + shownId);
          triggerOpt = trigger.data("options") || sip.defaults;
          if (shownId && triggerOpt.hideTrigger) {
            trigger.stop(true).fadeTo(triggerOpt.fadeSpeed, 1);
          }
          popup.removeClass().addClass(opt.theme).data({
            beingShown: true,
            shown: id
          }).find(".sipContent").html(self.data("hint"));
          win = $(window);
          xDistance = yDistance = opt.popupDistance;
          yOffset = opt.popupYOffset;
          offset = self.offset();
          popupH = popup.outerHeight();
          popupW = popup.outerWidth();
          popupCenter = popupW / 2;
          winWidth = win.width();
          winHeight = win.height();
          selfWidth = self.outerWidth();
          selfHeight = self.outerHeight();
          windowPadding = opt.windowPadding;
          popupOffsetLeft = offset.left + selfWidth / 2;
          popupOffsetTop = offset.top - popupH + yOffset;
          if (opt.horizontal) {
            xDistance = 0;
            popupOffsetTop += selfHeight / 2 + popupH / 2;
            if ((opt.preferredPosition === "left" && offset.left - popupW - opt.popupOffset > windowPadding) || offset.left + selfWidth + popupW > winWidth - windowPadding) {
              popup.addClass("sipPositionedLeft");
              popupOffsetLeft = offset.left - popupW - opt.popupOffset;
              yDistance = -yDistance;
            } else {
              popup.addClass("sipPositionedRight");
              popupOffsetLeft = offset.left + selfWidth + opt.popupOffset;
            }
          } else {
            yDistance = 0;
            if (popupOffsetLeft + popupCenter > winWidth - windowPadding) {
              popupOffsetLeft -= popupCenter * 2 - opt.popupOffset;
              popup.addClass("sipAlignLeft");
            } else if (popupOffsetLeft - popupCenter < windowPadding) {
              popupOffsetLeft -= opt.popupOffset;
              popup.addClass("sipAlignRight");
            } else {
              popupOffsetLeft -= popupCenter;
            }
            selfY = offset.top - win.scrollTop();
            popupY = popupH + opt.popupDistance - yOffset;
            if ((opt.preferredPosition === "bottom" && selfY + selfHeight + popupY < winHeight - windowPadding) || selfY - popupY < windowPadding) {
              popupOffsetTop += popupH + selfHeight - 2 * yOffset;
              xDistance = -xDistance;
              yOffset = 0;
              popup.addClass("sipAlignBottom");
            }
          }
          if (opt.hideTrigger) {
            $(".smallipop" + id).stop(true).fadeTo(opt.triggerAnimationSpeed, 0);
          }
          return popup.data({
            xDistance: xDistance,
            yDistance: yDistance
          }).stop(true).css({
            top: popupOffsetTop,
            left: popupOffsetLeft,
            display: "block",
            opacity: 0
          }).animate({
            top: "-=" + xDistance + "px",
            left: "+=" + yDistance + "px",
            opacity: 1
          }, opt.popupAnimationSpeed, opt.funcEase, function() {
            return popup.data("beingShown", false);
          });
        }, opt.popupDelay));
      }
    },
    triggerMouseout: function() {
      var id, popup, self, sip;
      self = $(this);
      sip = $.smallipop;
      popup = sip.popup;
      id = self.data("id");
      sip.killTimers();
      popup.data((id ? "triggerHovered" : "hovered"), false);
      if (!(popup.data("hovered") || popup.data("triggerHovered"))) {
        return popup.data("hideDelayTimer", setTimeout(sip.hideSmallipop, 500));
      }
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
    var popup, sip, triggerEvents;
    if (options == null) options = {};
    if (hint == null) hint = "";
    sip = $.smallipop;
    options = $.extend({}, sip.defaults, options);
    if (options.moveSpeed != null) options.popupAnimationSpeed = options.moveSpeed;
    if (options.hideSpeed != null) {
      options.triggerAnimationSpeed = options.hideSpeed;
    }
    triggerEvents = {};
    if (options.triggerOnClick || (options.touchSupport && sip.onTouchDevice())) {
      triggerEvents = {
        click: sip.showSmallipop
      };
    } else {
      triggerEvents = {
        mouseover: sip.triggerMouseover,
        mouseout: sip.triggerMouseout,
        click: sip.hideSmallipop
      };
    }
    popup = $("#smallipop");
    if (!popup.length) {
      popup = sip.popup = $("<div id=\"smallipop\"><div class=\"sipContent\"/><div class=\"sipArrowBorder\"/><div class=\"sipArrow\"/></div>").css("opacity", 0).data({
        xDistance: 0,
        yDistance: 0
      }).bind({
        mouseover: sip.triggerMouseover,
        mouseout: sip.triggerMouseout
      });
      $("body").append(popup);
      $("a", popup.get(0)).live("click", sip.hideSmallipop);
      $(document).bind("click touchend", sip.onWindowClick);
    }
    return this.each(function() {
      var newId, objHint, self;
      self = $(this);
      objHint = hint || self.attr("title") || self.find("." + options.infoClass).html();
      if (objHint && !self.hasClass("sipInitialized")) {
        newId = sip.lastId++;
        self.addClass("sipInitialized smallipop" + newId).data({
          id: newId,
          options: options,
          hint: objHint
        }).attr("title", "").bind(triggerEvents);
        return $("a", this).live("click", sip.hideSmallipop);
      }
    });
  };
})(jQuery);
