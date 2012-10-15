###!
Smallipop (10/14/2012)
Copyright (c) 2011-2012 Small Improvements (http://www.small-improvements.com)

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.

@author Sebastian Helzle (sebastian@helzle.net)
###

(($) ->
  $.smallipop =
    version: '0.2.1'
    defaults:
      contentAnimationSpeed: 150
      cssAnimations:
        enabled: false
        show: 'animated fadeIn'
        hide: 'animated fadeOut'
      funcEase: 'easeInOutQuad'
      handleInputs: true
      hideTrigger: false
      hideOnPopupClick: true
      hideOnTriggerClick: true
      horizontal: false
      infoClass: 'smallipopHint'
      invertAnimation: false
      popupOffset: 31
      popupYOffset: 0
      popupDistance: 20
      popupDelay: 100
      popupAnimationSpeed: 200
      preferredPosition: 'top' # bottom, top, left or right
      theme: 'default'
      touchSupport: true
      triggerAnimationSpeed: 150
      triggerOnClick: false
      onAfterHide: null
      onAfterShow: null
      onBeforeHide: null
      onBeforeShow: null
      windowPadding: 30 # Imaginary padding in viewport
    popup: null
    lastId: 1 # Counter for new smallipop id's

    _hideSmallipop: (e) ->
      sip = $.smallipop
      popup = sip.popup
      shownId = popup.data 'shown'
      target = if e?.target then $(e.target) else null

      # Show trigger if hidden before
      trigger = $ ".smallipop#{shownId}"
      triggerOptions = trigger.data('smallipop')?.options or sip.defaults

      # Do nothing if clicked and hide on click is disabled for this case
      return if target and trigger.length and e?.type is 'click' and \
        ((not triggerOptions.hideOnTriggerClick and target.is(trigger)) or \
        (not triggerOptions.hideOnPopupClick and popup.find(target).length))

      # Show trigger if it was hidden
      if shownId and triggerOptions.hideTrigger
        trigger.stop(true).fadeTo triggerOptions.triggerAnimationSpeed, 1

      direction = if triggerOptions.invertAnimation then -1 else 1
      xDistance = sip.popup.data('xDistance') * direction
      yDistance = sip.popup.data('yDistance') * direction

      popup
        .data
          hideDelayTimer: null
          beingShown: false

      if triggerOptions.cssAnimations.enabled
        popup
          .removeClass(triggerOptions.cssAnimations.show)
          .addClass(triggerOptions.cssAnimations.hide)
          .data('shown', '')

        triggerOptions.onAfterHide?()
      else
        popup
          .stop(true)
          .animate
              top: "-=#{xDistance}px"
              left: "+=#{yDistance}px"
              opacity: 0
            , triggerOptions.popupAnimationSpeed, triggerOptions.funcEase, ->
              # Hide tip if not being shown in the meantime
              tip = $ @
              unless tip.data 'beingShown'
                tip
                  .css('display', 'none')
                  .data('shown', '')

              triggerOptions.onAfterHide?()

    _showSmallipop: (e) ->
      sip = $.smallipop
      self = $ @
      triggerData = self.data 'smallipop'

      if sip.popup.data('shown') isnt triggerData.id \
        and not triggerData.type in ['checkbox', 'radio']
          e?.preventDefault()

      sip._triggerMouseover.call @

    onTouchDevice: ->
      Modernizr?.touch

    killTimers: ->
      popup = $.smallipop.popup
      hideTimer = popup.data 'hideDelayTimer'
      showTimer = popup.data 'showDelayTimer'
      clearTimeout(hideTimer) if hideTimer
      clearTimeout(showTimer) if showTimer

    refreshPosition: () ->
      sip = $.smallipop
      popup = sip.popup
      shownId = popup.data 'shown'

      return unless shownId

      trigger = $ ".smallipop#{shownId}"
      options = trigger.data('smallipop').options

      # Reset css classes for popup
      popup
        .removeClass()
        .addClass(options.theme)

      # Prepare some properties
      win = $ window
      xDistance = yDistance = options.popupDistance
      yOffset = options.popupYOffset

      # Get new dimensions
      offset = trigger.offset()

      popupH = popup.outerHeight()
      popupW = popup.outerWidth()
      popupCenter = popupW / 2

      winWidth = win.width()
      winHeight = win.height()
      windowPadding = options.windowPadding

      selfWidth = trigger.outerWidth()
      selfHeight = trigger.outerHeight()
      selfY = offset.top - win.scrollTop()

      popupOffsetLeft = offset.left + selfWidth / 2
      popupOffsetTop = offset.top - popupH + yOffset
      popupY = popupH + options.popupDistance - yOffset
      popupDistanceTop = selfY - popupY
      popupDistanceBottom = winHeight - selfY - selfHeight - popupY
      popupDistanceLeft = offset.left - popupW - options.popupOffset
      popupDistanceRight = winWidth - offset.left - selfWidth - popupW

      if options.horizontal
        xDistance = 0
        popupOffsetTop += selfHeight / 2 + popupH / 2
        if (options.preferredPosition is 'left' and popupDistanceLeft > windowPadding) or popupDistanceRight < windowPadding
          # Positioned left
          popup.addClass 'sipPositionedLeft'
          popupOffsetLeft = offset.left - popupW - options.popupOffset
          yDistance = -yDistance
        else
          # Positioned right
          popup.addClass 'sipPositionedRight'
          popupOffsetLeft = offset.left + selfWidth + options.popupOffset
      else
        yDistance = 0
        if popupOffsetLeft + popupCenter > winWidth - windowPadding
          # Aligned left
          popupOffsetLeft -= popupCenter * 2 - options.popupOffset
          popup.addClass 'sipAlignLeft'
        else if popupOffsetLeft - popupCenter < windowPadding
          # Aligned right
          popupOffsetLeft -= options.popupOffset
          popup.addClass 'sipAlignRight'
        else
          # Centered
          popupOffsetLeft -= popupCenter

        # Add class if positioned below
        if (options.preferredPosition is 'bottom' and popupDistanceBottom > windowPadding) or popupDistanceTop < windowPadding
          popupOffsetTop += popupH + selfHeight - 2 * yOffset
          xDistance = -xDistance
          yOffset = 0
          popup.addClass 'sipAlignBottom'

      # Hide trigger if defined
      if options.hideTrigger
        trigger
          .stop(true)
          .fadeTo(options.triggerAnimationSpeed, 0)

      # Animate to new position if refresh does no
      beingShown = popup.data 'beingShown'
      if not beingShown or options.cssAnimations.enabled
        popupOffsetTop -= xDistance
        popupOffsetLeft += yDistance
        xDistance = 0
        yDistance = 0

      popup
        .data
          xDistance: xDistance
          yDistance: yDistance

      cssTarget =
        top: popupOffsetTop
        left: popupOffsetLeft
        display: 'block'
        opacity: if beingShown and not options.cssAnimations.enabled then 0 else 1

      animationTarget =
        top: "-=#{xDistance}px"
        left: "+=#{yDistance}px"
        opacity: 1

      # Start fade in animation
      if options.cssAnimations.enabled
        popup
          .addClass(options.cssAnimations.show)
          .css(cssTarget)

        if beingShown
          popup.data 'beingShown', false
          options.onAfterShow? trigger
      else
        popup
          .stop(true)
          .css(cssTarget)
          .animate animationTarget, options.popupAnimationSpeed, options.funcEase, ->
            if beingShown
              popup.data 'beingShown', false
              options.onAfterShow? trigger

    _getTrigger: (id) ->
      $ ".smallipop#{id}"

    _showPopup: (trigger) ->
      sip = $.smallipop
      popup = sip.popup

      return unless popup.data 'triggerHovered'

      # Get smallipop options stored in trigger and popup
      triggerData = trigger.data('smallipop')
      shownId = popup.data 'shown'

      # Show last trigger if not yet visible
      if shownId
        lastTrigger = sip._getTrigger shownId
        lastTriggerOpt = lastTrigger.data('smallipop').options or sip.defaults
        if lastTriggerOpt.hideTrigger
          lastTrigger
            .stop(true)
            .fadeTo(lastTriggerOpt.fadeSpeed, 1)

      # Update tip content and remove all classes
      popup.data
        beingShown: true
        shown: triggerData.id
      sip.popupContent.html triggerData.hint

      sip.refreshPosition()

    _triggerMouseover: ->
      self = $ @
      sip = $.smallipop
      popup = sip.popup

      id = self.data('smallipop')?.id
      shownId = popup.data 'shown'

      sip.killTimers()
      popup.data (if id then 'triggerHovered' else 'hovered'), true

      unless id
        self = sip._getTrigger shownId
        id = shownId

      # We should have a valid id and an active trigger by now
      return unless self.length

      options = self.data('smallipop').options
      options.onBeforeShow? self

      if shownId isnt id
        popup.data 'showDelayTimer', setTimeout ->
            sip._showPopup self
          , options.popupDelay

    _triggerMouseout: ->
      self = $ @
      id = self.data('smallipop')?.id

      sip = $.smallipop
      popup = sip.popup
      popupData = popup.data()
      shownId = popupData.shown

      sip.killTimers()
      popup.data (if id then 'triggerHovered' else 'hovered'), false

      unless id
        self = sip._getTrigger shownId

      options = self.data('smallipop').options
      options.onBeforeHide? self

      # Hide tip after a while
      unless popupData.hovered or popupData.triggerHovered
        popup.data 'hideDelayTimer', setTimeout(sip._hideSmallipop, 500)

    _onWindowResize: ->
      $.smallipop.refreshPosition()

    _onWindowClick: (e) ->
      sip = $.smallipop
      popup = sip.popup
      target = $ e.target

      # Hide smallipop unless popup or a trigger is clicked
      unless target.is(popup) or target.closest('.sipInitialized').length
        sip._hideSmallipop e

    setContent: (content) ->
      sip = $.smallipop
      shownId = sip.popup.data 'shown'
      trigger = sip._getTrigger shownId
      options = trigger.data('smallipop').options

      sip.popupContent
        .stop(true)
        .fadeTo options.contentAnimationSpeed, 0, ->
          sip.popupContent
            .html(content)
            .fadeTo options.contentAnimationSpeed, 1
          sip.refreshPosition()

    _destroy: (instances) ->
      instances.each ->
        self = $ @
        data = self.data('smallipop')
        if data
          self
            .unbind('.smallipop')
            .data('smallipop', {})
            .removeClass "smallipop sipInitialized smallipop#{data.id} #{data.options.theme}"

    _init: ->
      sip = $.smallipop
      popup = sip.popup = $('
          <div id="smallipop">
            <div class="sipContent"/>
            <div class="sipArrowBorder"/>
            <div class="sipArrow"/>
          </div>
        ')
        .css('opacity', 0)
        .data
          xDistance: 0
          yDistance: 0
        .bind
          'mouseover.smallipop': sip._triggerMouseover
          'mouseout.smallipop': sip._triggerMouseout

      sip.popupContent = popup.find '.sipContent'

      $('body').append popup

      # Hide popup when clicking a contained link
      popup.delegate 'a', 'click.smallipop', sip._hideSmallipop

      $(document).bind 'click.smallipop touchend.smallipop', sip._onWindowClick

      $(window).bind 'resize.smallipop', sip._onWindowResize

  ### Add default easing function for smallipop to jQuery if missing ###
  unless $.easing.easeInOutQuad
    $.easing.easeInOutQuad = (x, t, b, c, d) ->
      if ((t/=d/2) < 1) then c/2*t*t + b else -c/2 * ((--t)*(t-2) - 1) + b

  $.fn.smallipop = (options={}, hint='') ->
    sip = $.smallipop

    # Handle direct method calls
    if typeof(options) is 'string'
      switch options.toLowerCase()
        when 'show' then sip._showSmallipop.call @first().get(0)
        when 'hide' then sip._hideSmallipop()
        when 'destroy' then sip._destroy @
      return @

    options = $.extend {}, sip.defaults, options

    # Fix for some option deprecation issues
    options.popupAnimationSpeed = options.moveSpeed if options.moveSpeed?
    options.triggerAnimationSpeed = options.hideSpeed if options.hideSpeed?

    # Check for enabled css animations and disable if modernizr is active says no
    if Modernizr?.cssanimations is false
      options.cssAnimations.enabled = false

    # Initialize smallipop on first call
    sip._init() unless sip.popup

    return @.each ->
      self = $ @
      tagName = self[0].tagName.toLowerCase()
      type = self.attr 'type'

      # Get content for the popup
      objHint = hint or self.attr('title') or self.find(".#{options.infoClass}").html()

      # Initialize each trigger, create id and bind events
      if objHint and not self.hasClass 'sipInitialized'
        newId = sip.lastId++
        triggerOptions = $.extend true, {}, options
        triggerEvents = {}
        isFormElement = triggerOptions.handleInputs and tagName in ['input', 'select', 'textarea']

        # Activate on blur events if used on inputs and disable hide on click
        if isFormElement
          # Don't hide when trigger is clicked and show when trigger is clicked
          triggerOptions.hideOnTriggerClick = false
          # triggerOptions.triggerOnClick = true
          triggerEvents['focus.smallipop'] = sip._triggerMouseover
          triggerEvents['blur.smallipop'] = sip._triggerMouseout
        else
          triggerEvents['mouseout.smallipop'] = sip._triggerMouseout

        # Check whether the trigger should activate smallipop by click or hover
        if triggerOptions.triggerOnClick or (triggerOptions.touchSupport and sip.onTouchDevice())
          triggerEvents['click.smallipop'] = sip._showSmallipop
        else
          triggerEvents['click.smallipop'] = sip._hideSmallipop
          triggerEvents['mouseover.smallipop'] = sip._triggerMouseover

        # Store parameters for this trigger
        self
          .addClass("sipInitialized smallipop#{newId}")
          .attr('title', '') # Remove title to disable browser hint
          .data 'smallipop',
            id: newId
            hint: objHint
            options: triggerOptions
            tagName: tagName
            type: type
          .bind triggerEvents

        # Hide popup when links contained in the trigger are clicked
        unless triggerOptions.hideOnTriggerClick
          self.delegate 'a', 'click.smallipop', sip._hideSmallipop
)(jQuery)

