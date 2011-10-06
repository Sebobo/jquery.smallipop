/*!
SmallIPop 0.1 (09/28/2011)
Copyright (c) 2011 Small Improvements (http://www.small-improvements.com)

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.

@author Sebastian Helzle (sebastian@small-improvements.com)
*/(function($) {
  $.smallipop = {
    defaults: {
      popupOffset: 31,
      popupYOffset: 0,
      popupDistance: 20,
      popupDelay: 100,
      hideTrigger: false,
      theme: "default",
      infoClass: "smallipopHint",
      hideSpeed: 150,
      moveSpeed: 200
    },
    popup: null,
    lastId: 1,
    hideSmallipop: function() {
      var shownId, sip, trigger, triggerOpt;
      sip = $.smallipop;
      shownId = sip.popup.data("shown");
      trigger = $(".smallipop" + shownId);
      triggerOpt = trigger.data("options") || sip.defaults;
      if (shownId && triggerOpt.hideTrigger) {
        trigger.stop(true).fadeTo(triggerOpt.hideSpeed, 1);
      }
      return sip.popup.data({
        hideDelayTimer: null,
        beingShown: false
      }).stop(true).animate({
        top: "-=" + sip.popup.data("distance") + "px",
        opacity: 0
      }, {
        duration: triggerOpt.speed,
        step: sip.func_ease,
        complete: function() {
          if (!$(this).data("beingShown")) {
            return $(this).css("display", "none").data("shown", "");
          }
        }
      });
    },
    killTimers: function() {
      var hideTimer, popup, showTimer;
      popup = $.smallipop.popup;
      hideTimer = popup.data("hideDelayTimer");
      showTimer = popup.data("showDelayTimer");
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
      if (showTimer) {
        return clearTimeout(showTimer);
      }
    },
    func_ease: function(x, t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b;
      } else {
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
      }
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
          var distance, offset, popupCenter, popupH, popupOffsetLeft, popupOffsetTop, selfHeight, selfWidth, trigger, triggerOpt, win, windowPadding, yOffset;
          if (!popup.data("triggerHovered")) {
            return;
          }
          trigger = $(".smallipop" + shownId);
          triggerOpt = trigger.data("options") || sip.defaults;
          if (shownId && triggerOpt.hideTrigger) {
            trigger.stop(true).fadeTo(triggerOpt.fadeSpeed, 1);
          }
          win = $(window);
          distance = opt.popupDistance;
          yOffset = opt.popupYOffset;
          popup.removeClass().addClass(opt.theme).data({
            beingShown: true,
            shown: id
          }).find(".bubbleContent").html(self.data("hint") || self.find("." + opt.infoClass).html());
          offset = self.offset();
          popupH = popup.outerHeight();
          popupCenter = popup.outerWidth() / 2;
          selfWidth = self.outerWidth();
          selfHeight = self.outerHeight();
          windowPadding = 30;
          popupOffsetLeft = offset.left + selfWidth / 2;
          if (popupOffsetLeft + popupCenter > win.width() - windowPadding) {
            popupOffsetLeft -= popupCenter * 2 - opt.popupOffset;
            popup.addClass("alignLeft");
          } else if (popupOffsetLeft - popupCenter < windowPadding) {
            popupOffsetLeft -= opt.popupOffset;
            popup.addClass("alignRight");
          } else {
            popupOffsetLeft -= popupCenter;
          }
          popupOffsetTop = offset.top - popupH + yOffset;
          if (offset.top - win.scrollTop() < popupH + opt.popupDistance + windowPadding - yOffset) {
            popupOffsetTop += popupH + selfHeight;
            distance = -distance;
            yOffset = 0;
            popup.addClass("alignBottom");
          }
          if (opt.hideTrigger) {
            $(".smallipop" + id).stop(true).fadeTo(opt.hideSpeed, 0);
          }
          return popup.data("distance", distance).stop(true).css({
            top: popupOffsetTop,
            left: popupOffsetLeft,
            display: "block",
            opacity: 0
          }).animate({
            top: "-=" + distance + "px",
            opacity: 1
          }, {
            duration: opt.moveSpeed,
            step: sip.func_ease,
            complete: function() {
              return popup.data("beingShown", false);
            }
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
  return $.fn.smallipop = function(options, hint) {
    var popup, sip;
    if (options == null) {
      options = {};
    }
    if (hint == null) {
      hint = "";
    }
    sip = $.smallipop;
    popup = $("#smallipop");
    if (!popup.length) {
      popup = sip.popup = $("<div id=\"smallipop\"><div class=\"bubbleContent\"/><div class=\"bubbleArrowBorder\"/><div class=\"bubbleArrow\"/></div>").css("opacity", 0).bind({
        mouseover: sip.triggerMouseover,
        mouseout: sip.triggerMouseout
      });
      $("body").append(popup);
      $("a", popup.get(0)).live("click", sip.hideSmallipop);
    }
    return this.each(function() {
      var newId, self;
      self = $(this);
      if (!self.hasClass("initialized")) {
        sip = $.smallipop;
        newId = sip.lastId++;
        self.addClass("initialized smallipop" + newId).data({
          id: newId,
          options: $.extend({}, sip.defaults, options),
          hint: hint || self.attr("title") || ""
        }).attr("title", "").bind({
          mouseover: sip.triggerMouseover,
          mouseout: sip.triggerMouseout,
          click: sip.hideSmallipop
        });
        return $("a", this).live("click", sip.hideSmallipop);
      }
    });
  };
})(jQuery);