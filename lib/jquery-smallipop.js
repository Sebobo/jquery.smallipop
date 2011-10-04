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
      popupDelay: 200,
      hideTrigger: false,
      theme: "default",
      infoClass: "info",
      hideSpeed: 150,
      moveSpeed: 200,
      centered: false
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
      }, triggerOpt.speed, "swing", function() {
        if (!$(this).data("beingShown")) {
          return $(this).css("display", "none").data("shown", "");
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
          var distance, offset, popupH, popupOffsetLeft, popupOffsetTop, popupW, trigger, triggerOpt, win, yOffset;
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
          popupW = popup.outerWidth();
          popupH = popup.outerHeight();
          popupOffsetLeft = opt.popupOffset - self.outerWidth() / 2;
          if (opt.centered) {
            popupOffsetLeft += popupW / 2;
          } else if (offset.left + popupW > win.width() - 50) {
            popupOffsetLeft = popupW - 2 * opt.popupOffset;
            popup.addClass("alignLeft");
          }
          if (offset.top - win.scrollTop() < popupH + opt.popupDistance + 50) {
            popupOffsetTop = -self.outerHeight();
            distance = -distance;
            yOffset = 0;
            return popup.addClass("alignBottom");
          } else {
            popupOffsetTop = popupH;
            if (opt.hideTrigger) {
              $(".smallipop" + id).stop(true).fadeTo(opt.hideSpeed, 0);
            }
            return popup.data("distance", distance).stop(true).css({
              top: offset.top - popupOffsetTop + yOffset,
              left: offset.left - popupOffsetLeft,
              display: "block",
              opacity: 0
            }).animate({
              top: "-=" + distance + "px",
              opacity: 1
            }, opt.moveSpeed, "swing", function() {
              return popup.data("beingShown", false);
            });
          }
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