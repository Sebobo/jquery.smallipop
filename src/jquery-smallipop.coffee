###!
SmallIPop 0.1 (09/28/2011)
Copyright (c) 2011 Small Improvements (http://www.small-improvements.com)

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.

@author Sebastian Helzle (sebastian@small-improvements.com)
###

(($) ->
  $.smallipop =
    version: '0.1.1'
    defaults: 
      popupOffset: 31
      popupYOffset: 0
      popupDistance: 20
      popupDelay: 100
      hideTrigger: false
      theme: "default"
      infoClass: "smallipopHint"
      hideSpeed: 150
      moveSpeed: 200
      invertAnimation: false
      horizontal: false
    popup: null
    lastId: 1 # Counter for new smallipop id's
    
    hideSmallipop: ->
      sip = $.smallipop
      shownId = sip.popup.data("shown")
      
      # Show trigger if hidden before
      trigger = $(".smallipop#{shownId}")
      triggerOpt = trigger.data("options") or sip.defaults
      trigger.stop(true).fadeTo(triggerOpt.hideSpeed, 1) if shownId and triggerOpt.hideTrigger
      
      xDistance = sip.popup.data("xDistance") * if triggerOpt.invertAnimation then -1 else 1
      yDistance = sip.popup.data("yDistance") * if triggerOpt.invertAnimation then -1 else 1
      
      sip.popup
      .data
        hideDelayTimer: null
        beingShown: false
      .stop(true).animate(
          top: "-=" + xDistance + "px"
          left: "+=" + yDistance + "px"
          opacity: 0
        , 
          duration: triggerOpt.speed
          step: sip.func_ease 
          complete: ->
            # Hide tip if not being shown in the meantime
            $(@).css("display", "none").data("shown", "") if not $(@).data("beingShown")
      )
      
    killTimers: ->
      popup = $.smallipop.popup
      hideTimer = popup.data("hideDelayTimer")
      showTimer = popup.data("showDelayTimer")
      clearTimeout(hideTimer) if hideTimer
      clearTimeout(showTimer) if showTimer  
      
    func_ease: (x, t, b, c, d) ->
      if (t/=d/2) < 1 
        c/2*t*t + b 
      else 
        -c/2 * ((--t)*(t-2) - 1) + b
      
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
          
          # Prepare some properties
          win = $(window)
          xDistance = yDistance = opt.popupDistance
          yOffset = opt.popupYOffset
        
          # Update tip content and remove all classes
          popup
          .removeClass()
          .addClass(opt.theme)
          .data
            beingShown: true
            shown: id
          .find(".bubbleContent").html(self.data("hint") or self.find(".#{opt.infoClass}").html())
          
          # Get new dimensions
          offset = self.offset()
          popupH = popup.outerHeight()
          popupW = popup.outerWidth()
          popupCenter = popupW / 2
          winWidth = win.width()
          selfWidth = self.outerWidth()
          selfHeight = self.outerHeight()
          windowPadding = 30 # Imaginary padding in viewport
          popupOffsetLeft = offset.left + selfWidth / 2
          popupOffsetTop = offset.top - popupH + yOffset
          
          if opt.horizontal
            xDistance = 0
            popupOffsetTop += selfHeight / 2 + popupH / 2
            if offset.left + selfWidth + popupW > winWidth - windowPadding
              # Positioned left
              popup.addClass("positionedLeft")
              popupOffsetLeft = offset.left - popupW - opt.popupOffset 
              yDistance = -yDistance
            else
              # Positioned right
              popup.addClass("positionedRight")
              popupOffsetLeft = offset.left + selfWidth + opt.popupOffset 
          else
            yDistance = 0
            if popupOffsetLeft + popupCenter > winWidth - windowPadding
              # Aligned left
              popupOffsetLeft -= popupCenter * 2 - opt.popupOffset 
              popup.addClass("alignLeft")
            else if popupOffsetLeft - popupCenter < windowPadding
              # Aligned right
              popupOffsetLeft -= opt.popupOffset 
              popup.addClass("alignRight")
            else
              # Centered
              popupOffsetLeft -= popupCenter
            
            # Add class if positioned below  
            if offset.top - win.scrollTop() < popupH + opt.popupDistance + windowPadding - yOffset
              popupOffsetTop += popupH + selfHeight
              xDistance = -xDistance
              yOffset = 0
              popup.addClass("alignBottom")
            
          # Hide trigger if defined
          $(".smallipop#{id}").stop(true).fadeTo(opt.hideSpeed, 0) if opt.hideTrigger
    
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
            , 
              duration: opt.moveSpeed 
              step: sip.func_ease 
              complete: -> popup.data("beingShown", false)
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
   
  $.fn.smallipop = (options={}, hint="") ->
    sip = $.smallipop
    
    # Initialize puff tooltip if necessary
    popup = $("#smallipop")
    unless popup.length
      popup = sip.popup = $("<div id=\"smallipop\"><div class=\"bubbleContent\"/><div class=\"bubbleArrowBorder\"/><div class=\"bubbleArrow\"/></div>")
      .css("opacity", 0)
      .bind
        mouseover: sip.triggerMouseover
        mouseout: sip.triggerMouseout
        
      $("body").append(popup)
      
      # Hide popup when clicking a link inside  
      $("a", popup.get(0)).live("click", sip.hideSmallipop)
        
    return @.each ->
      # Initialize each trigger, create id and bind events
      self = $(@)
      unless self.hasClass("initialized")
        sip = $.smallipop
        newId = sip.lastId++
        self
        .addClass("initialized smallipop#{newId}")
        .data
          id: newId
          options: $.extend({}, sip.defaults, options)
          hint: hint or self.attr("title") or ""
        .attr("title", "") # Remove title to disable browser hint
        .bind 
          mouseover: sip.triggerMouseover
          mouseout: sip.triggerMouseout
          click: sip.hideSmallipop
        # Hide popup when children of trigger are clicked
        $("a", @).live("click", sip.hideSmallipop)
)(jQuery)        
      