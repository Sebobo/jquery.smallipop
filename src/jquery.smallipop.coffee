###!
Smallipop (01/22/2013)
Copyright (c) 2011-2013 Small Improvements (http://www.small-improvements.com)

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.

@author Sebastian Helzle (sebastian@helzle.net)
###

(($) ->
  $.smallipop = sip =
    version: '0.3.5'
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
      prev: 'Back'
      next: 'Next'
      close: 'Close'
      of: 'of'
    instances: {}
    scrollTimer: null
    templates:
      popup: '
        <div class="smallipop-instance">
          <div class="sipContent"/>
          <div class="sipArrowBorder"/>
          <div class="sipArrow"/>
        </div>'
    tours: {}

    _hideSmallipop: (e) ->
      target = if e?.target then $(e.target) else e
      for popupId, popup of sip.instances
        popupData = popup.data()

        continue unless shownId = popupData.shown
        continue if popupData.isTour and not popup.is target

        trigger = $ ".smallipop#{shownId}"
        triggerOptions = trigger.data('smallipop')?.options or sip.defaults

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
            .data('shown', '')

          if triggerOptions.onAfterHide
            window.setTimeout triggerOptions.onAfterHide, triggerOptions.popupAnimationSpeed
        else
          direction = if triggerOptions.invertAnimation then -1 else 1
          xDistance = popupData.xDistance * direction
          yDistance = popupData.yDistance * direction

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

    _refreshPosition: ->
      for popupId, popup of sip.instances
        popupData = popup.data()
        shownId = popupData.shown
        continue unless shownId

        trigger = $ ".smallipop#{shownId}"
        options = trigger.data('smallipop').options

        # Remove alignment classes
        popup.removeClass (index, classNames) ->
          return (classNames?.match(/sip\w+/g) or []).join ' '

        # Add theme class
        popup.addClass options.theme

        # Prepare some properties
        win = $ window
        xDistance = yDistance = options.popupDistance
        yOffset = options.popupYOffset

        # Get new dimensions
        isFixed = popup.data('position') is 'fixed'
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

        if options.preferredPosition in ['left', 'right']
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

        # Animate to new position if refresh does nothing
        opacity = 0
        doAnimate = popupData.beingShown and not options.cssAnimations.enabled

        unless doAnimate
          popupOffsetTop -= xDistance
          popupOffsetLeft += yDistance
          xDistance = 0
          yDistance = 0
          opacity = 1

        if isFixed
          popupOffsetLeft -= win.scrollLeft()
          popupOffsetTop -= win.scrollTop()

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
          top: "-=#{xDistance}px"
          left: "+=#{yDistance}px"
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
              .fadeTo(lastTriggerOpt.fadeSpeed, 1)

      popupContent = content or triggerData.hint
      # If referenced content element is defined, use it's content
      if triggerData.options.referencedContent and not content
        popupContent = $(triggerData.options.referencedContent).html() or popupContent

      # Update tip content and remove all classes
      popup
        .data
          beingShown: true
          shown: triggerData.id
        .find('.sipContent').html popupContent

      # Check if trigger has fixed position
      popup
        .data('position', '')
        .css('position', 'absolute')

      elemToCheck = trigger
      while elemToCheck.length and elemToCheck[0].nodeName isnt 'HTML'
        if elemToCheck.css('position') is 'fixed'
          popup
            .data('position', 'fixed')
            .css('position', 'fixed')
          break
        elemToCheck = elemToCheck.parent()

      # Remove some css classes
      popup.attr('class', 'smallipop-instance') if triggerData.id isnt shownId
      sip._refreshPosition()

    _triggerMouseover: ->
      trigger = popup = $ @
      isTrigger = trigger.hasClass 'sipInitialized'
      unless isTrigger
        trigger = sip._getTrigger popup.data('shown')

      return unless trigger.length
      triggerData = trigger.data 'smallipop'
      popup = triggerData.popupInstance
        .data((if isTrigger then 'triggerHovered' else 'hovered'), true)
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
        .data((if isTrigger then 'triggerHovered' else 'hovered'), false)
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
      sip.scrollTimer = setTimeout sip._refreshPosition, 250

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

    _runTour: (trigger) ->
      triggerData = trigger.data 'smallipop'
      tourTitle = triggerData?.tourTitle
      return unless tourTitle and sip.tours[tourTitle]

      # Sort tour elements before running by their index
      sip.tours[tourTitle].sort (a, b) ->
        a.index - b.index

      sip.currentTour = tourTitle
      currentTourItems = sip.tours[tourTitle]
      for i in [0..currentTourItems.length - 1] when currentTourItems[i].id is triggerData.id
        return sip._tourShow tourTitle, i

    _tourShow: (title, index) ->
      currentTourItems = sip.tours[title]
      return unless currentTourItems

      trigger = currentTourItems[index].trigger
      triggerData = trigger.data 'smallipop'

      prevButton = if index > 0 then "<a href=\"#\" class=\"smallipop-tour-prev\">#{sip.labels.prev}</a>" else ''
      nextButton = if index < currentTourItems.length - 1 then "<a href=\"#\" class=\"smallipop-tour-next\">#{sip.labels.next}</a>" else ''
      closeButton = if index is currentTourItems.length - 1 then "<a href=\"#\" class=\"smallipop-tour-close\">#{sip.labels.close}</a>" else ''

      content = "
        <div class=\"smallipop-tour-content\">#{triggerData.hint}</div>
        <div class=\"smallipop-tour-footer\">
          <div class=\"smallipop-tour-progress\">
            #{index + 1} #{sip.labels.of} #{currentTourItems.length}
          </div>
          #{prevButton}
          #{nextButton}
          #{closeButton}
          <br style=\"clear:both;\"/>
        </div>"

      sip._killTimers triggerData.popupInstance
      triggerData.popupInstance.data 'triggerHovered', true

      # Scroll to trigger if it isn't visible
      sip._showWhenVisible trigger, content

    _showWhenVisible: (trigger, content) ->
      targetPosition = trigger.offset().top
      offset = targetPosition - $(document).scrollTop()
      windowHeight = $(window).height()
      triggerOptions = trigger.data('smallipop').options

      if offset < triggerOptions.autoscrollPadding or offset > windowHeight - triggerOptions.autoscrollPadding
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

      # Fire close callback
      sip._getTrigger(popup.data('shown')).data('smallipop')?.options.onTourClose?()

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
          .delegate('.smallipop-tour-close', 'click.smallipop', sip._tourClose)
      else
        instance
          .delegate('a', 'click.smallipop', sip._hideSmallipop)

      # Bind some events to the document and window if we created the first smallipop
      if sip.nextInstanceId is 2
        $(document).bind 'click.smallipop touchend.smallipop', sip._hideSmallipop
        $(window).bind
          'resize.smallipop': sip._refreshPosition
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
        when 'tour' then sip._runTour @first()
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
      objHint = hint or self.find(".#{options.infoClass}").html() or self.attr('title')

      # Initialize each trigger, create id and bind events
      if objHint and not self.hasClass 'sipInitialized'
        newId = sip.lastId++

        triggerEvents = {}
        triggerPopupInstance = popup
        triggerOptions = $.extend true, {}, options

        # Extend the trigger options by options set in data attribute
        for option, value of triggerData when option.indexOf('smallipop') >= 0
          optionName = option.replace 'smallipop', ''
          optionName = optionName.substr(0, 1).toLowerCase() + optionName.substr(1)
          triggerOptions[optionName] = value

        isFormElement = triggerOptions.handleInputs and tagName in ['input', 'select', 'textarea']

        # Activate on blur events if used on inputs and disable hide on click
        if isFormElement
          # Don't hide when trigger is clicked and show when trigger is clicked
          triggerOptions.hideOnTriggerClick = false
          triggerEvents['focus.smallipop'] = sip._triggerMouseover
          triggerEvents['blur.smallipop'] = sip._triggerMouseout
        else
          triggerEvents['mouseout.smallipop'] = sip._triggerMouseout

        # Check whether the trigger should activate smallipop by click or hover
        if triggerOptions.triggerOnClick or (triggerOptions.touchSupport and sip._onTouchDevice())
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
