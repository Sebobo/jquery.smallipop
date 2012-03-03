###!
Smallipop 0.1.6 (03/03/2012)
Copyright (c) 2011-2012 Small Improvements (http://www.small-improvements.com)

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.

@author Sebastian Helzle (sebastian@small-improvements.com)
###

(($) ->
  $.smallipop =
    version: '0.1.6'
    defaults: 
      popupOffset: 31
      popupYOffset: 0
      popupDistance: 20
      popupDelay: 100
      windowPadding: 30 # Imaginary padding in viewport
      hideTrigger: false
      theme: "default"
      infoClass: "smallipopHint"
      triggerAnimationSpeed: 150
      popupAnimationSpeed: 200
      invertAnimation: false
      horizontal: false
      preferredPosition: "top" # bottom, top, left or right
      triggerOnClick: false
      touchSupport: true
      funcEase: "easeInOutQuad"
    popup: null
    lastId: 1 # Counter for new smallipop id's
    
    hideSmallipop: ->
      sip = $.smallipop
      shownId = sip.popup.data("shown")
      
      # Show trigger if hidden before
      trigger = $(".smallipop#{shownId}")
      triggerOpt = trigger.data("options") or sip.defaults
      trigger.stop(true).fadeTo(triggerOpt.triggerAnimationSpeed, 1) if shownId and triggerOpt.hideTrigger
      
      direction = if triggerOpt.invertAnimation then -1 else 1
      xDistance = sip.popup.data("xDistance") * direction
      yDistance = sip.popup.data("yDistance") * direction
      
      sip.popup
      .data
        hideDelayTimer: null
        beingShown: false
      .stop(true).animate(
          top: "-=" + xDistance + "px"
          left: "+=" + yDistance + "px"
          opacity: 0
        , triggerOpt.popupAnimationSpeed, triggerOpt.funcEase, ->
          # Hide tip if not being shown in the meantime
          tip = $(@)
          tip.css("display", "none").data("shown", "") unless tip.data("beingShown")
      )
      
    showSmallipop: (e) ->
      sip = $.smallipop
      e.preventDefault() if sip.popup.data("shown") isnt $(@).data("id") 
      
      sip.triggerMouseover.call(@)
      
    onWindowClick: (e) ->
      sip = $.smallipop
      popup = sip.popup
      # Hide smallipop unless tooltip bubble or a trigger is clicked
      unless e.target is popup[0] or $(e.target).closest(".sipInitialized").length
        sip.hideSmallipop.call(@)
      
    onTouchDevice: ->
      return Modernizr?.touch
      
    killTimers: ->
      popup = $.smallipop.popup
      hideTimer = popup.data("hideDelayTimer")
      showTimer = popup.data("showDelayTimer")
      clearTimeout(hideTimer) if hideTimer
      clearTimeout(showTimer) if showTimer  
      
    triggerMouseover: ->
      self = $(@)
      id = self.data("id")
      sip = $.smallipop
      popup = sip.popup
      shownId = popup.data("shown")
      
      sip.killTimers()
      popup.data((if id then "triggerHovered" else "hovered"), true)
      
      if id and not popup.data("beingShown") and shownId isnt id
        opt = self.data("options")
        popup.data("showDelayTimer", setTimeout ->  
          return unless popup.data("triggerHovered")
          
          # Show last trigger if not yet visible
          trigger = $(".smallipop#{shownId}")
          triggerOpt = trigger.data("options") or sip.defaults
          trigger.stop(true).fadeTo(triggerOpt.fadeSpeed, 1) if shownId and triggerOpt.hideTrigger
        
          # Update tip content and remove all classes
          popup
          .removeClass()
          .addClass(opt.theme)
          .data
            beingShown: true
            shown: id
          .find(".sipContent").html(self.data("hint"))
          
          # Prepare some properties
          win = $(window)
          xDistance = yDistance = opt.popupDistance
          yOffset = opt.popupYOffset
          
          # Get new dimensions
          offset = self.offset()
          popupH = popup.outerHeight()
          popupW = popup.outerWidth()
          popupCenter = popupW / 2
          winWidth = win.width()
          winHeight = win.height()
          selfWidth = self.outerWidth()
          selfHeight = self.outerHeight()
          windowPadding = opt.windowPadding
          popupOffsetLeft = offset.left + selfWidth / 2
          popupOffsetTop = offset.top - popupH + yOffset
          
          if opt.horizontal
            xDistance = 0
            popupOffsetTop += selfHeight / 2 + popupH / 2
            if (opt.preferredPosition is "left" and offset.left - popupW - opt.popupOffset > windowPadding) or offset.left + selfWidth + popupW > winWidth - windowPadding
              # Positioned left
              popup.addClass("sipPositionedLeft")
              popupOffsetLeft = offset.left - popupW - opt.popupOffset 
              yDistance = -yDistance
            else
              # Positioned right
              popup.addClass("sipPositionedRight")
              popupOffsetLeft = offset.left + selfWidth + opt.popupOffset 
          else
            yDistance = 0
            if popupOffsetLeft + popupCenter > winWidth - windowPadding
              # Aligned left
              popupOffsetLeft -= popupCenter * 2 - opt.popupOffset 
              popup.addClass("sipAlignLeft")
            else if popupOffsetLeft - popupCenter < windowPadding
              # Aligned right
              popupOffsetLeft -= opt.popupOffset 
              popup.addClass("sipAlignRight")
            else
              # Centered
              popupOffsetLeft -= popupCenter
            
            # Add class if positioned below  
            selfY = offset.top - win.scrollTop()
            popupY = popupH + opt.popupDistance - yOffset
            if (opt.preferredPosition is "bottom" and selfY + selfHeight + popupY < winHeight - windowPadding) or selfY - popupY < windowPadding
              popupOffsetTop += popupH + selfHeight - 2 * yOffset
              xDistance = -xDistance
              yOffset = 0
              popup.addClass("sipAlignBottom")
            
          # Hide trigger if defined
          $(".smallipop#{id}").stop(true).fadeTo(opt.triggerAnimationSpeed, 0) if opt.hideTrigger
    
          # Start fade in animation
          popup.data(
            xDistance: xDistance
            yDistance: yDistance
          ).stop(true).css(
            top: popupOffsetTop
            left: popupOffsetLeft
            display: "block"
            opacity: 0
          ).animate(
              top: "-=" + xDistance + "px"
              left: "+=" + yDistance + "px"
              opacity: 1
            , opt.popupAnimationSpeed, opt.funcEase, -> 
              popup.data("beingShown", false)
          )
        , opt.popupDelay)
        
    triggerMouseout: ->
      self = $(@)
      sip = $.smallipop
      popup = sip.popup
      id = self.data("id")
      sip.killTimers()
      popup.data((if id then "triggerHovered" else "hovered"), false)
      
      # Hide tip after a while
      unless popup.data("hovered") or popup.data("triggerHovered")
        popup.data("hideDelayTimer", setTimeout(sip.hideSmallipop, 500))
        
  ### Add default easing function for smallipop to jQuery if missing ###
  unless $.easing.easeInOutQuad        
    $.easing.easeInOutQuad = (x, t, b, c, d) ->
      if ((t/=d/2) < 1) then c/2*t*t + b else -c/2 * ((--t)*(t-2) - 1) + b
   
  $.fn.smallipop = (options={}, hint="") ->
    sip = $.smallipop
    options = $.extend({}, sip.defaults, options)
    
    # Fix for some option deprecation issues
    options.popupAnimationSpeed = options.moveSpeed if options.moveSpeed?
    options.triggerAnimationSpeed = options.hideSpeed if options.hideSpeed?
    
    # Check whether the trigger should activate smallipop by click or hover
    triggerEvents = {}
    if options.triggerOnClick or (options.touchSupport and sip.onTouchDevice())
      triggerEvents =
        click: sip.showSmallipop
    else
      triggerEvents =
        mouseover: sip.triggerMouseover
        mouseout: sip.triggerMouseout
        click: sip.hideSmallipop
        
    # Initialize smallipop on first call
    popup = $("#smallipop")
    unless popup.length
      popup = sip.popup = $("<div id=\"smallipop\"><div class=\"sipContent\"/><div class=\"sipArrowBorder\"/><div class=\"sipArrow\"/></div>")
      .css("opacity", 0)
      .data
        xDistance: 0
        yDistance: 0
      .bind
        mouseover: sip.triggerMouseover
        mouseout: sip.triggerMouseout
        
      $("body").append(popup)
      
      # Hide popup when clicking a contained link  
      $("a", popup.get(0)).live("click", sip.hideSmallipop)
      
      $(document).bind "click touchend", sip.onWindowClick
        
    return @.each ->
      # Initialize each trigger, create id and bind events
      self = $(@)
      objHint = hint or self.attr("title") or self.find(".#{options.infoClass}").html()
      if objHint and not self.hasClass("sipInitialized")
        newId = sip.lastId++
        self
        .addClass("sipInitialized smallipop#{newId}")
        .data
          id: newId
          options: options
          hint: objHint
        .attr("title", "") # Remove title to disable browser hint
        .bind(triggerEvents)
          
        # Hide popup when links contained in the trigger are clicked
        $("a", @).live("click", sip.hideSmallipop)
)(jQuery)        
      
