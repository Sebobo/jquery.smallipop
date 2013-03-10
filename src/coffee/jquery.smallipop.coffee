###!
Smallipop (03/10/2013)
Copyright (c) 2011-2013 Small Improvements (http://www.small-improvements.com)

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.

@author Sebastian Helzle (sebastian@helzle.net)
###

(($) ->
  $.smallipop = sip =
    version: '0.5.1'
    defaults:
      autoscrollPadding: 200
      contentAnimationSpeed: 150
      cssAnimations:
        enabled: false
        show: 'animated fadeIn'
        hide: 'animated fadeOut'
      funcEase: 'easeInOutQuad'
      handleInputs: true
      hideDelay: 500
      hideTrigger: false
      hideOnPopupClick: true
      hideOnTriggerClick: true
      infoClass: 'smallipopHint'
      invertAnimation: false
      popupOffset: 31
      popupYOffset: 0
      popupDistance: 20
      popupDelay: 100
      popupAnimationSpeed: 200
      preferredPosition: 'top' # bottom, top, left or right
      referencedSelector: null
      theme: 'default'
      touchSupport: true
      tourHighlight: false
      tourHighlightColor: '#222'
      tourHightlightFadeDuration: 200
      tourHighlightOpacity: .5
      tourHighlightZIndex: 9997
      triggerAnimationSpeed: 150
      triggerOnClick: false
      onAfterHide: null
      onAfterShow: null
      onBeforeHide: null
      onBeforeShow: null
      onTourClose: null
      onTourNext: null
      onTourPrev: null
      windowPadding: 30 # Imaginary padding in viewport
    currentTour: null
    lastId: 1 # Counter for new smallipop id's
    nextInstanceId: 1 # Counter for new smallipop id's
    lastScrollCheck: 0
    labels:
      prev: 'Prev'
      next: 'Next'
      close: 'Close'
      of: 'of'
    instances: {}
    scrollTimer: null
    refreshQueueTimer: null
    templates:
      popup:
        '<div class="smallipop-instance">' +
          '<div class="sipContent"/>' +
          '<div class="sipArrowBorder"/>' +
          '<div class="sipArrow"/>' +
        '</div>'
    tours: {}

    _hideSmallipop: (e) ->
      clearTimeout sip.scrollTimer

      target = if e?.target then $(e.target) else e
      for popupId, popup of sip.instances
        popupData = popup.data()

        continue unless shownId = popupData.shown
        continue if popupData.isTour and not popup.is target

        trigger = $ ".smallipop#{shownId}"
        triggerOptions = trigger.data('smallipop')?.options or sip.defaults

        # Fire close callback
        if popupData.isTour
          sip.currentTour = null
          trigger.data('smallipop')?.options.onTourClose?()
          @_hideTourOverlay triggerOptions

        # Do nothing if clicked and hide on click is disabled for this case
        ignoreTriggerClick = not triggerOptions.hideOnTriggerClick \
          and target.is trigger
        ignorePopupClick = not triggerOptions.hideOnPopupClick \
          and popup.find(target).length

        continue if target and trigger.length and e?.type is 'click' \
          and (ignoreTriggerClick or ignorePopupClick)

        # Show trigger if it was hidden
        if shownId and triggerOptions.hideTrigger
          trigger.stop(true).fadeTo triggerOptions.triggerAnimationSpeed, 1

        popup.data
          hideDelayTimer: null
          beingShown: false

        if triggerOptions.cssAnimations.enabled
          popup
            .removeClass(triggerOptions.cssAnimations.show)
            .addClass(triggerOptions.cssAnimations.hide)
            .data 'shown', ''

          if triggerOptions.onAfterHide
            window.setTimeout triggerOptions.onAfterHide, triggerOptions.popupAnimationSpeed
        else
          direction = if triggerOptions.invertAnimation then -1 else 1
          xDistance = popupData.xDistance * direction
          yDistance = popupData.yDistance * direction

          popup
            .stop(true)
            .animate
                top: "-=#{yDistance}px"
                left: "+=#{xDistance}px"
                opacity: 0
              , triggerOptions.popupAnimationSpeed, triggerOptions.funcEase, ->
                # Hide tip if not being shown in the meantime
                self = $ @
                unless self.data 'beingShown'
                  self
                    .css('display', 'none')
                    .data('shown', '')

                triggerOptions.onAfterHide?()

    _showSmallipop: (e) ->
      triggerData = $(@).data 'smallipop'

      if triggerData.popupInstance.data('shown') isnt triggerData.id \
        and not triggerData.type in ['checkbox', 'radio']
          e?.preventDefault()

      sip._triggerMouseover.call @

    _onTouchDevice: ->
      Modernizr?.touch

    _killTimers: (popup) ->
      clearTimeout popup.data('hideDelayTimer')
      clearTimeout popup.data('showDelayTimer')

    ###
    Queue a refresh to the popups position
    ###
    _queueRefreshPosition: (delay=50) ->
      clearTimeout sip.refreshQueueTimer
      sip.refreshQueueTimer = setTimeout sip._refreshPosition, delay

    ###
    Refresh the position for each visible popup
    ###
    _refreshPosition: (resetTheme=true) ->
      for popupId, popup of sip.instances
        popupData = popup.data()
        shownId = popupData.shown
        continue unless shownId

        trigger = $ ".smallipop#{shownId}"
        triggerData = trigger.data 'smallipop'
        options = triggerData.options

        # Remove alignment classes
        popup.removeClass (index, classNames) ->
          return (classNames?.match(/sip\w+/g) or []).join ' '

        # Reset theme class
        if resetTheme
          popup.attr 'class', "smallipop-instance #{options.theme}"

        # Prepare some properties
        win = $ window
        xDistance = yDistance = options.popupDistance
        xOffset = options.popupOffset
        yOffset = options.popupYOffset
        isFixed = popup.data('position') is 'fixed'

        # Get popup dimensions
        popupH = popup.outerHeight()
        popupW = popup.outerWidth()
        popupCenter = popupW / 2
        # popup.css 'width', popupW

        # Get viewport dimensions and offsets
        winWidth = win.width()
        winHeight = win.height()
        winScrollTop = win.scrollTop()
        winScrollLeft = win.scrollLeft()
        windowPadding = options.windowPadding

        # Get trigger dimensions and offset
        offset = trigger.offset()
        selfWidth = trigger.outerWidth()
        selfHeight = trigger.outerHeight()
        selfY = offset.top - winScrollTop

        # Compute distances and offsets
        popupOffsetLeft = offset.left + selfWidth / 2
        popupOffsetTop = offset.top - popupH + yOffset
        popupY = popupH + options.popupDistance - yOffset
        popupDistanceTop = selfY - popupY
        popupDistanceBottom = winHeight - selfY - selfHeight - popupY
        popupDistanceLeft = offset.left - popupW - xOffset
        popupDistanceRight = winWidth - offset.left - selfWidth - popupW

        # Check desired position and try to fit the popup into the viewport
        preferredPosition = options.preferredPosition
        if preferredPosition in ['left', 'right']
          yDistance = 0
          popupOffsetTop += selfHeight / 2 + popupH / 2
          if (preferredPosition is 'right' and popupDistanceRight > windowPadding) \
              or popupDistanceLeft < windowPadding
            # Positioned right
            popup.addClass 'sipPositionedRight'
            popupOffsetLeft = offset.left + selfWidth + xOffset
          else
            # Positioned left
            popup.addClass 'sipPositionedLeft'
            popupOffsetLeft = offset.left - popupW - xOffset
            xDistance = -xDistance
        else
          xDistance = 0
          if popupOffsetLeft + popupCenter > winWidth - windowPadding
            # Aligned left
            popupOffsetLeft -= popupCenter * 2 - xOffset
            popup.addClass 'sipAlignLeft'
          else if popupOffsetLeft - popupCenter < windowPadding
            # Aligned right
            popupOffsetLeft -= xOffset
            popup.addClass 'sipAlignRight'
          else
            # Centered
            popupOffsetLeft -= popupCenter

          # Move right if popup would violate left viewport bounds
          if popupOffsetLeft < windowPadding
            popupOffsetLeft = windowPadding

          # Add class if positioned below
          if (preferredPosition is 'bottom' and popupDistanceBottom > windowPadding) \
              or popupDistanceTop < windowPadding
            yDistance = -yDistance
            popupOffsetTop += popupH + selfHeight - 2 * yOffset
            popup.addClass 'sipAlignBottom'

        # Move Smallipop vertically if it wouldn't fit in the viewport
        if popupH < selfHeight
          yOverflow = popupOffsetTop + popupH + windowPadding - yDistance \
            + yOffset - winScrollTop - winHeight
          if yOverflow > 0
            popupOffsetTop = Math.max popupOffsetTop - yOverflow - windowPadding
              , offset.top + yOffset + windowPadding + yDistance

        # Move Smallipop horizontally if it wouldn't fit in the viewport
        # and it's smaller than the trigger
        if popupW < selfWidth
          xOverflow = popupOffsetLeft + popupW + windowPadding + xDistance \
            + xOffset - winScrollLeft - winWidth
          if xOverflow > 0
            popupOffsetLeft = Math.max popupOffsetLeft - xOverflow + windowPadding
              , offset.left + xOffset + windowPadding - xDistance

        # Hide trigger if defined
        if options.hideTrigger
          trigger
            .stop(true)
            .fadeTo options.triggerAnimationSpeed, 0

        opacity = 0
        # Animate to new position if refresh does nothing
        if not popupData.beingShown or options.cssAnimations.enabled
          popupOffsetTop -= yDistance
          popupOffsetLeft += xDistance
          xDistance = 0
          yDistance = 0
          opacity = 1

        # If the element is fixed, it has to be moved by the current scroll offset
        if isFixed
          popupOffsetLeft -= winScrollLeft
          popupOffsetTop -= winScrollTop

        popup
          .data
            xDistance: xDistance
            yDistance: yDistance
          .css
            top: popupOffsetTop
            left: popupOffsetLeft
            display: 'block'
            opacity: opacity

        # Start fade in animation
        sip._fadeInPopup popup,
          top: "-=#{yDistance}px"
          left: "+=#{xDistance}px"
          opacity: 1

    _fadeInPopup: (popup, animationTarget) ->
      options = sip._getTrigger(popup.data('shown')).data('smallipop')?.options or sip.defaults
      if options.cssAnimations.enabled
        popup.addClass options.cssAnimations.show
        window.setTimeout ->
            sip._fadeInPopupFinished popup, options
          , options.popupAnimationSpeed
      else
        popup
          .stop(true)
          .animate animationTarget, options.popupAnimationSpeed, options.funcEase, ->
            sip._fadeInPopupFinished popup, options

    _fadeInPopupFinished: (popup, options) ->
      popupData = popup.data()
      if popupData.beingShown
        popup.data 'beingShown', false
        options.onAfterShow? sip._getTrigger(popupData.shown)

    _getTrigger: (id) ->
      $ ".smallipop#{id}"

    _showPopup: (trigger, content='') ->
      # Get smallipop options stored in trigger and popup
      triggerData = trigger.data 'smallipop'
      triggerOptions = triggerData.options
      popup = triggerData.popupInstance
      return unless popup.data 'triggerHovered'

      # Show last trigger if not yet visible
      shownId = popup.data 'shown'
      if shownId
        lastTrigger = sip._getTrigger shownId
        if lastTrigger.length
          lastTriggerOpt = lastTrigger.data('smallipop').options or sip.defaults
          if lastTriggerOpt.hideTrigger
            lastTrigger
              .stop(true)
              .fadeTo lastTriggerOpt.fadeSpeed, 1

      # Display overlay under the trigger when tourHighlight is enabled
      if triggerOptions.tourHighlight and triggerOptions.tourIndex
        tourOverlay = @_getTourOverlay triggerOptions

        @_resetTourZIndices()

        # Set position at least to relative if it's static, or z-index won't work
        if trigger.css('position') is 'static'
          trigger.css 'position', 'relative'

        # Trigger should stay on top of the overlay
        unless trigger.data 'originalZIndex'
          trigger.data 'originalZIndex', trigger.css 'zIndex'

        trigger.css 'zIndex', triggerOptions.tourHighlightZIndex + 1

        # Show overlay
        tourOverlay
          .fadeTo triggerOptions.tourHightlightFadeDuration, triggerOptions.tourHighlightOpacity
      else
        @_hideTourOverlay triggerOptions

      popupContent = content or triggerData.hint
      # If referenced content element is defined, use it's content
      if triggerOptions.referencedContent and not content
        popupContent = $(triggerOptions.referencedContent).clone(true, true) or popupContent

      popupPosition = if @_isElementFixed trigger then 'fixed' else 'absolute'

      if shownId isnt triggerData.id
        popup.hide 0

      # Update tip content and remove all classes
      popup
        .data
          beingShown: true
          shown: triggerData.id
          position: popupPosition
        .find('.sipContent').empty().append popupContent

      # Check if trigger has fixed position
      popup.css 'position', popupPosition

      # Queue the next refresh
      sip._queueRefreshPosition 0

    _isElementFixed: (element) ->
      elemToCheck = element
      while elemToCheck.length and elemToCheck[0].nodeName isnt 'HTML'
        if elemToCheck.css('position') is 'fixed'
          return true
        elemToCheck = elemToCheck.parent()
      false

    _triggerMouseover: ->
      trigger = popup = $ @
      isTrigger = trigger.hasClass 'sipInitialized'
      unless isTrigger
        trigger = sip._getTrigger popup.data('shown')

      return unless trigger.length
      triggerData = trigger.data 'smallipop'
      popup = triggerData.popupInstance
        .data (if isTrigger then 'triggerHovered' else 'hovered'), true
      sip._killTimers popup
      shownId = popup.data 'shown'

      # We should have a valid id and an active trigger by now
      if shownId isnt triggerData.id or popup.css('opacity') is 0
        triggerData.options.onBeforeShow? trigger
        popup
          .data 'showDelayTimer', setTimeout ->
              sip._showPopup trigger
            , triggerData.options.popupDelay

    _triggerMouseout: ->
      trigger = popup = $ @
      isTrigger = trigger.hasClass 'sipInitialized'
      unless isTrigger
        trigger = sip._getTrigger popup.data('shown')

      return unless trigger.length
      triggerData = trigger.data 'smallipop'
      popup = triggerData.popupInstance
        .data (if isTrigger then 'triggerHovered' else 'hovered'), false
      sip._killTimers popup

      # Hide tip after a while
      popupData = popup.data()
      unless popupData.hovered or popupData.triggerHovered
        triggerData.options.onBeforeHide? trigger
        popup
          .data 'hideDelayTimer', setTimeout ->
              sip._hideSmallipop popup
            , triggerData.options.hideDelay

    _onWindowScroll: (e) ->
      clearTimeout sip.scrollTimer
      sip.scrollTimer = setTimeout =>
          sip._refreshPosition false
        , 250

    setContent: (trigger, content) ->
      return unless trigger?.length
      triggerData = trigger.data 'smallipop'
      partOfTour = triggerData.tourTitle

      if partOfTour
        popupContent = triggerData.popupInstance.find('.smallipop-tour-content')
      else
        popupContent = triggerData.popupInstance.find('.sipContent')

      if popupContent.html() isnt content
        popupContent
          .stop(true)
          .fadeTo triggerData.options.contentAnimationSpeed, 0, ->
            $(@)
              .html(content)
              .fadeTo triggerData.options.contentAnimationSpeed, 1
            sip._refreshPosition()

    _runTour: (trigger, step) ->
      triggerData = trigger.data 'smallipop'
      tourTitle = triggerData?.tourTitle
      return unless tourTitle and sip.tours[tourTitle]

      # Sort tour elements before running by their index
      sip.tours[tourTitle].sort (a, b) ->
        a.index - b.index

      # Check if a valid step as array index was provided
      unless typeof step is 'number' and step % 1 is 0
        step = 0
      else
        step -= 1

      sip.currentTour = tourTitle
      currentTourItems = sip.tours[tourTitle]
      for i in [0..currentTourItems.length - 1] when i is step \
          or currentTourItems[i].id is triggerData.id
        return sip._tourShow tourTitle, i

    _tourShow: (title, index) ->
      currentTourItems = sip.tours[title]
      return unless currentTourItems

      trigger = currentTourItems[index].trigger
      triggerData = trigger.data 'smallipop'

      prevButton = if index > 0 then "<a href=\"#\" class=\"smallipop-tour-prev\">#{sip.labels.prev}</a>" else ''
      nextButton = if index < currentTourItems.length - 1 then "<a href=\"#\" class=\"smallipop-tour-next\">#{sip.labels.next}</a>" else ''
      closeButton = if index is currentTourItems.length - 1 then "<a href=\"#\" class=\"smallipop-tour-close\">#{sip.labels.close}</a>" else ''
      closeIcon = "<a href=\"#\" class=\"smallipop-tour-close-icon\">&Chi;</a>"

      $content = $($.trim "
        <div class=\"smallipop-tour-content\"></div>
        #{closeIcon}
        <div class=\"smallipop-tour-footer\">
          <div class=\"smallipop-tour-progress\">
            #{index + 1} #{sip.labels.of} #{currentTourItems.length}
          </div>
          #{prevButton}
          #{nextButton}
          #{closeButton}
        </div>")

      # Append hint object to tour content
      $content.eq(0).append triggerData.hint

      sip._killTimers triggerData.popupInstance
      triggerData.popupInstance.data 'triggerHovered', true

      # Scroll to trigger if it isn't visible
      sip._showWhenVisible trigger, $content

    _getTourOverlay: (options) ->
      overlay = $ '#smallipop-tour-overlay'
      unless overlay.length
        overlay = $('<div id="smallipop-tour-overlay"/>')
          .appendTo($('body'))
          .fadeOut 0

      overlay.css
        backgroundColor: options.tourHighlightColor
        zIndex: options.tourHighlightZIndex

    _hideTourOverlay: (options) ->
      $('#smallipop-tour-overlay').fadeOut options.tourHightlightFadeDuration
      @_resetTourZIndices()

    _resetTourZIndices: ->
      # Reset z-index for all other triggers in tours
      for tour, steps of sip.tours
        for step in steps
          tourTrigger = step.trigger
          if tourTrigger.data 'originalZIndex'
            tourTrigger.css 'zIndex', tourTrigger.data('originalZIndex')

    _showWhenVisible: (trigger, content) ->
      targetPosition = trigger.offset().top
      offset = targetPosition - $(document).scrollTop()
      windowHeight = $(window).height()
      triggerOptions = trigger.data('smallipop').options

      # First scroll to trigger then show tour
      if not @_isElementFixed(trigger) and (offset < triggerOptions.autoscrollPadding or offset > windowHeight - triggerOptions.autoscrollPadding)
        $('html, body').animate
            scrollTop: targetPosition - windowHeight / 2
          , 800, 'swing', ->
            sip._showPopup trigger, content
      else
        sip._showPopup trigger, content

    _tourNext: (e) ->
      e?.preventDefault()
      currentTourItems = sip.tours[sip.currentTour]
      return unless currentTourItems

      # Get currently shown tour item
      popup = currentTourItems[0].popupInstance
      shownId = popup.data('shown') or currentTourItems[0].id

      for i in [0..currentTourItems.length - 2] when currentTourItems[i].id is shownId
        currentTourItems[i].trigger
          .data('smallipop')?.options.onTourNext?(currentTourItems[i + 1].trigger)
        return sip._tourShow sip.currentTour, i + 1

    _tourPrev: (e) ->
      e?.preventDefault()
      currentTourItems = sip.tours[sip.currentTour]
      return unless currentTourItems

      # Get currently shown tour item
      popup = currentTourItems[0].popupInstance
      shownId = popup.data('shown') or currentTourItems[0].id

      for i in [1..currentTourItems.length - 1] when currentTourItems[i].id is shownId
        currentTourItems[i].trigger
          .data('smallipop')?.options.onTourPrev?(currentTourItems[i - 1].trigger)
        return sip._tourShow sip.currentTour, i - 1

    _tourClose: (e) ->
      e?.preventDefault()
      popup = $(e.target).closest '.smallipop-instance'

      sip._hideSmallipop popup

    _destroy: (instances) ->
      instances.each ->
        self = $ @
        data = self.data 'smallipop'
        if data
          self
            .unbind('.smallipop')
            .data('smallipop', {})
            .removeClass "smallipop sipInitialized smallipop#{data.id} #{data.options.theme}"

    _onWindowKeyUp: (e) ->
      targetIsInput = e?.target.tagName.toLowerCase() in ['input', 'textarea']

      switch e.which
        # Escape - close all popups
        when 27 then sip._hideSmallipop popup for popupId, popup of sip.instances
        # Arrow left
        when 37 then sip._tourPrev() unless targetIsInput
        # Arrow right
        when 39 then sip._tourNext() unless targetIsInput

    _getInstance: (id='default', isTour=false) ->
      return sip.instances[id] if sip.instances[id]

      instance = $(sip.templates.popup)
        .css('opacity', 0)
        .attr('id', "smallipop#{sip.nextInstanceId++}")
        .addClass('smallipop-instance')
        .data
          xDistance: 0
          yDistance: 0
          isTour: isTour
        .bind
          'mouseover.smallipop': sip._triggerMouseover
          'mouseout.smallipop': sip._triggerMouseout

      $('body').append instance

      # Add some binding to events in the popup
      if isTour
        instance
          .delegate('.smallipop-tour-prev', 'click.smallipop', sip._tourPrev)
          .delegate('.smallipop-tour-next', 'click.smallipop', sip._tourNext)
          .delegate('.smallipop-tour-close, .smallipop-tour-close-icon', 'click.smallipop', sip._tourClose)
      else
        instance
          .delegate('a', 'click.smallipop', sip._hideSmallipop)

      # Bind some events to the document and window if we created the first smallipop
      if sip.nextInstanceId is 2
        $(document).bind 'click.smallipop touchend.smallipop', sip._hideSmallipop
        $(window).bind
          'resize.smallipop': sip._queueRefreshPosition
          'scroll.smallipop': sip._onWindowScroll
          'keyup': sip._onWindowKeyUp

      sip.instances[id] = instance

  ### Add default easing function for smallipop to jQuery if missing ###
  unless $.easing.easeInOutQuad
    $.easing.easeInOutQuad = (x, t, b, c, d) ->
      if ((t/=d/2) < 1) then c/2*t*t + b else -c/2 * ((--t)*(t-2) - 1) + b

  $.fn.smallipop = (options={}, hint='') ->
    # Handle direct method calls
    if typeof(options) is 'string'
      switch options.toLowerCase()
        when 'show' then sip._showSmallipop.call @first().get(0)
        when 'hide' then sip._hideSmallipop @first().get(0)
        when 'destroy' then sip._destroy @
        when 'tour' then sip._runTour @first(), hint
        when 'update' then sip.setContent @first(), hint
      return @

    options = $.extend {}, sip.defaults, options

    # Check for enabled css animations and disable if modernizr is active says no
    if Modernizr?.cssanimations is false
      options.cssAnimations.enabled = false

    # Initialize smallipop on first call
    popup = sip._getInstance()

    return @.each ->
      self = $ @
      tagName = self[0].tagName.toLowerCase()
      type = self.attr 'type'
      triggerData = self.data()

      # Get content for the popup
      # If it's inline markup, create a deep copy of the hint html
      objHint = hint or self.attr('title')

      $objInfo = $ ".#{options.infoClass}", self
      if $objInfo.length
        objHint = $objInfo.clone(true, true)
          .removeClass("#{options.infoClass}")

      # Initialize each trigger, create id and bind events
      if objHint and not self.hasClass 'sipInitialized'
        newId = sip.lastId++

        triggerEvents = {}
        triggerPopupInstance = popup
        triggerOptions = $.extend true, {}, options

        # Check if inline smallipop options are provided as object or single data attributes
        if typeof(triggerData['smallipop']) is 'object'
          $.extend true, triggerOptions, triggerData['smallipop']

        # Extend the trigger options by options set in data attribute
        for option, value of triggerData when option.indexOf('smallipop') >= 0
          optionName = option.replace 'smallipop', ''
          if optionName
            optionName = optionName.substr(0, 1).toLowerCase() + optionName.substr(1)
            triggerOptions[optionName] = value

        isFormElement = triggerOptions.handleInputs \
          and tagName in ['input', 'select', 'textarea']

        # Activate on blur events if used on inputs and disable hide on click
        if isFormElement
          # Don't hide when trigger is clicked and show when trigger is clicked
          triggerOptions.hideOnTriggerClick = false
          triggerEvents['focus.smallipop'] = sip._triggerMouseover
          triggerEvents['blur.smallipop'] = sip._triggerMouseout
        else
          triggerEvents['mouseout.smallipop'] = sip._triggerMouseout

        # Check whether the trigger should activate smallipop by click or hover
        if triggerOptions.triggerOnClick or \
            (triggerOptions.touchSupport and sip._onTouchDevice())
          triggerEvents['click.smallipop'] = sip._showSmallipop
        else
          triggerEvents['click.smallipop'] = sip._triggerMouseout
          triggerEvents['mouseover.smallipop'] = sip._triggerMouseover

        # Add to tours if tourTitle is set
        if triggerOptions.tourIndex
          tourTitle = triggerOptions.tourTitle or 'defaultTour'

          # Disable all trigger events
          triggerEvents = {}
          triggerOptions.hideOnTriggerClick = false
          triggerOptions.hideOnPopupClick = false
          triggerPopupInstance = sip._getInstance tourTitle, true

          sip.tours[tourTitle] = [] unless sip.tours[tourTitle]
          sip.tours[tourTitle].push
            index: triggerOptions.tourIndex or 0
            id: newId
            trigger: self
            popupInstance: triggerPopupInstance

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
            tourTitle: tourTitle
            popupInstance: triggerPopupInstance
          .bind triggerEvents

        # Hide popup when links contained in the trigger are clicked
        unless triggerOptions.hideOnTriggerClick
          self.delegate 'a', 'click.smallipop', sip._hideSmallipop
)(jQuery)
