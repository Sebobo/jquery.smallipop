###!
Smallipop (07/12/2013)
Copyright (c) 2011-2013 Small Improvements (http://www.small-improvements.com)

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.

@author Sebastian Helzle (sebastian@helzle.net)
###

(((factory) ->
  if typeof define is 'function' and define.amd
    define ['jquery'], factory
  else
    factory jQuery
)(($) ->
  # CSS classes
  classBase           = 'smallipop'
  classHint           = classBase + '-hint'
  classInstance       = classBase + '-instance'
  classContent        = classBase + '-content'
  classLeft           = classBase + '-left'
  classRight          = classBase + '-right'
  classBottom         = classBase + '-bottom'
  classAlignLeft      = classBase + '-align-left'
  classAlignRight     = classBase + '-align-right'
  classInitialized    = classBase + '-initialized'
  classTheme          = classBase + '-theme-'
  classTour           = classBase + '-tour'
  classTourContent    = classTour + '-content'
  classTourOverlay    = classTour + '-overlay'
  classTourFooter     = classTour + '-footer'
  classTourCloseIcon  = classTour + '-close-icon'
  classTourProgress   = classTour + '-progress'
  classTourClose      = classTour + '-close'
  classTourPrev       = classTour + '-prev'
  classTourNext       = classTour + '-next'

  # Event names
  eventFocus          = 'focus.' + classBase
  eventClick          = 'click.' + classBase
  eventBlur           = 'blur.' + classBase
  eventMouseOut       = 'mouseout.' + classBase
  eventMouseOver      = 'mouseover.' + classBase
  eventTouchEnd       = 'touchend.' + classBase
  eventResize         = 'resize.' + classBase
  eventScroll         = 'scroll.' + classBase
  eventKeyUp          = 'keyup.' + classBase

  # Data names
  dataZIndex          = classBase + 'OriginalZIndex'
  dataBeingShown      = classBase + 'BeingShown'
  dataTimerHide       = classBase + 'HideDelayTimer'
  dataTimerShow       = classBase + 'ShowDelayTimer'
  dataTriggerHovered  = classBase + 'TriggerHovered'
  dataPopupHovered    = classBase + 'PopupHovered'
  dataShown           = classBase + 'Shown'
  dataPosition        = classBase + 'Position'
  dataXDistance       = classBase + 'XDistance'
  dataYDistance       = classBase + 'YDistance'
  dataIsTour          = classBase + 'IsTour'

  # Regular expressions
  reAlignmentClass = new RegExp classBase + '-(align|bottom)\w*', "g"
  reBaseClass = new RegExp classBase + '\w+', "g"

  # Global elements
  $document = $ document
  $window = $ window
  $overlay = null
  instances = {}

  # Tour vars
  tours = {}
  currentTour = null

  # Id vars
  lastId = 1 # Counter for new smallipop id's
  nextInstanceId = 1 # Counter for new smallipop container id's

  # Timing vars
  scrollTimer = null
  lastScrollCheck = 0
  refreshQueueTimer = null

  # Templates
  popupTemplate = "<div class='#{classInstance}'><div class='#{classContent}'/></div>"

  $.smallipop = sip =
    version: '0.6.1'
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
      infoClass: classHint
      invertAnimation: false
      popupId: ''
      popupOffset: 31
      popupYOffset: 0
      popupDistance: 20
      popupDelay: 100
      popupAnimationSpeed: 200
      preferredPosition: 'top' # bottom, top, left or right
      referencedContent: null
      theme: 'default'
      touchSupport: true
      tourHighlight: false
      tourHighlightColor: '#222'
      tourHighlightFadeDuration: 200
      tourHighlightOpacity: .5
      tourHighlightZIndex: 9997
      tourNavigationEnabled: true
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
      labels:
        prev: 'Prev'
        next: 'Next'
        close: 'Close'
        of: 'of'

  # Add default easing function for smallipop to jQuery if missing
  unless $.easing.easeInOutQuad
    $.easing.easeInOutQuad = (x, t, b, c, d) ->
      if ((t/=d/2) < 1) then c/2*t*t + b else -c/2 * ((--t)*(t-2) - 1) + b

  # Reset z-index for all other triggers in tours
  resetTourZIndices = ->
    for tour, steps of tours
      for step in steps
        tourTrigger = step.trigger
        if tourTrigger.data dataZIndex
          tourTrigger.css 'zIndex', tourTrigger.data(dataZIndex)

  touchEnabled = Modernizr?.touch
  cssAnimationsEnabled = Modernizr?.cssanimations

  getTrigger = (id) ->
    $ ".#{classBase + id}"

  # Returns the overlay and creates it if necessary
  getOverlay = ->
    unless $overlay
      $overlay = $("<div id='#{classTourOverlay}'/>").appendTo($('body')).fadeOut 0
    $overlay

  hideTourOverlay = (options) ->
    getOverlay().fadeOut options.tourHighlightFadeDuration
    resetTourZIndices()

  hideSmallipop = (e) ->
    clearTimeout scrollTimer

    target = if e?.target then $(e.target) else e
    for popupId, popup of instances
      popupData = popup.data()

      continue unless shownId = popupData[dataShown]

      trigger = getTrigger shownId
      triggerIsTarget = trigger.is target
      triggerData = trigger.data(classBase)
      triggerOptions = triggerData.options or sip.defaults

      continue if (popupData[dataIsTour] or triggerData.isFormElement) \
        and not popup.is(target) \
        and not (triggerIsTarget and popup.is(triggerOptions.popupInstance))

      # Fire close callback
      if popupData[dataIsTour]
        currentTour = null
        trigger.data(classBase)?.options.onTourClose?()
        hideTourOverlay triggerOptions

      # Do nothing if clicked and hide on click is disabled for this case
      ignoreTriggerClick = not triggerOptions.hideOnTriggerClick and triggerIsTarget
      ignorePopupClick = not triggerOptions.hideOnPopupClick \
        and popup.find(target).length

      continue if target and trigger.length and e?.type in ['click', 'touchend'] \
        and (ignoreTriggerClick or ignorePopupClick)

      # Show trigger if it was hidden
      if shownId and triggerOptions.hideTrigger
        trigger.stop(true).fadeTo triggerOptions.triggerAnimationSpeed, 1

      popup
        .data(dataTimerHide, null)
        .data(dataBeingShown, false)

      if triggerOptions.cssAnimations.enabled
        popup
          .removeClass(triggerOptions.cssAnimations.show)
          .addClass(triggerOptions.cssAnimations.hide)
          .data dataShown, ''

        if triggerOptions.onAfterHide
          window.setTimeout triggerOptions.onAfterHide, triggerOptions.popupAnimationSpeed
      else
        direction = if triggerOptions.invertAnimation then -1 else 1
        xDistance = popupData[dataXDistance] * direction
        yDistance = popupData[dataYDistance] * direction

        popup
          .stop(true)
          .animate
              top: "-=#{yDistance}"
              left: "+=#{xDistance}"
              opacity: 0
            , triggerOptions.popupAnimationSpeed, triggerOptions.funcEase, ->
              # Hide tip if not being shown in the meantime
              self = $ @
              unless self.data dataBeingShown
                self
                  .css('display', 'none')
                  .data(dataShown, '')

              triggerOptions.onAfterHide?()

  showSmallipop= (e) ->
    triggerData = $(@).data classBase
    return unless triggerData

    if triggerData.popupInstance.data(dataShown) isnt triggerData.id \
      and not triggerData.type in ['checkbox', 'radio']
        e?.preventDefault()

    triggerMouseover.call @

  killTimers = (popup) ->
    clearTimeout popup.data(dataTimerHide)
    clearTimeout popup.data(dataTimerShow)

  # Queue a refresh to the popups position
  queueRefreshPosition = (delay=50) ->
    clearTimeout refreshQueueTimer
    refreshQueueTimer = setTimeout refreshPosition, delay

  # Class filtering helpers
  filterClass = (classStr, re) ->
    if classStr then (classStr.match(re) or []).join ' '

  filterAlignmentClass = (idx, classStr) ->
    filterClass classStr, reAlignmentClass

  filterBaseClass = (idx, classStr) ->
    filterClass classStr, reBaseClass

  # Refresh the position for each visible popup
  refreshPosition = (resetTheme=true) ->
    for popupId, popup of instances
      popupData = popup.data()
      shownId = popupData[dataShown]
      continue unless shownId

      trigger = getTrigger shownId
      triggerData = trigger.data classBase
      options = triggerData.options

      # Remove alignment classes
      popup.removeClass filterAlignmentClass

      # Reset theme class
      if resetTheme
        themes = classTheme + options.theme.split(' ').join(" " + classTheme)
        popup.attr 'class', "#{classInstance} #{themes}"

      # Prepare some properties
      win = $ window
      xDistance = yDistance = options.popupDistance
      xOffset = options.popupOffset
      yOffset = options.popupYOffset
      isFixed = popup.data(dataPosition) is 'fixed'

      # Get popup dimensions
      popupH = popup.outerHeight()
      popupW = popup.outerWidth()
      popupCenter = popupW / 2

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
          popup.addClass classRight
          popupOffsetLeft = offset.left + selfWidth + xOffset
        else
          # Positioned left
          popup.addClass classLeft
          popupOffsetLeft = offset.left - popupW - xOffset
          xDistance = -xDistance
      else
        xDistance = 0
        if popupOffsetLeft + popupCenter > winWidth - windowPadding
          # Aligned left
          popupOffsetLeft -= popupCenter * 2 - xOffset
          popup.addClass classAlignLeft
        else if popupOffsetLeft - popupCenter < windowPadding
          # Aligned right
          popupOffsetLeft -= xOffset
          popup.addClass classAlignRight
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
          popup.addClass classBottom

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
      if not popupData[dataBeingShown] or options.cssAnimations.enabled
        popupOffsetTop -= yDistance
        popupOffsetLeft += xDistance
        xDistance = yDistance = 0
        opacity = 1

      # If the element is fixed, it has to be moved by the current scroll offset
      if isFixed
        popupOffsetLeft -= winScrollLeft
        popupOffsetTop -= winScrollTop

      popup
        .data(dataXDistance, xDistance)
        .data(dataYDistance, yDistance)
        .css
          top: popupOffsetTop
          left: popupOffsetLeft
          display: 'block'
          opacity: opacity

      # Start fade in animation
      fadeInPopup popup,
        top: "-=#{yDistance}"
        left: "+=#{xDistance}"
        opacity: 1

  forceRefreshPosition = ->
    refreshPosition false

  fadeInPopup = (popup, animationTarget) ->
    options = getTrigger(popup.data(dataShown)).data(classBase)?.options or sip.defaults
    if options.cssAnimations.enabled
      popup.addClass options.cssAnimations.show
      window.setTimeout ->
          fadeInPopupFinished popup, options
        , options.popupAnimationSpeed
    else
      popup
        .stop(true)
        .animate animationTarget, options.popupAnimationSpeed, options.funcEase, ->
          fadeInPopupFinished popup, options

  fadeInPopupFinished = (popup, options) ->
    popupData = popup.data()
    if popupData[dataBeingShown]
      popup.data dataBeingShown, false
      options.onAfterShow? getTrigger(popupData[dataShown])

  showPopup = (trigger, content='') ->
    # Get smallipop options stored in trigger and popup
    triggerData = trigger.data classBase
    triggerOptions = triggerData.options
    popup = triggerData.popupInstance
    return unless popup.data dataTriggerHovered

    # Show last trigger if not yet visible
    shownId = popup.data dataShown
    if shownId
      lastTrigger = getTrigger shownId
      if lastTrigger.length
        lastTriggerOpt = lastTrigger.data(classBase).options or sip.defaults
        if lastTriggerOpt.hideTrigger
          lastTrigger
            .stop(true)
            .fadeTo lastTriggerOpt.fadeSpeed, 1

    # Display overlay under the trigger when tourHighlight is enabled
    if triggerOptions.tourHighlight and triggerOptions.tourIndex
      tourOverlay = getOverlay().css
        backgroundColor: triggerOptions.tourHighlightColor
        zIndex: triggerOptions.tourHighlightZIndex

      resetTourZIndices()

      # Set position at least to relative if it's static, or z-index won't work
      if trigger.css('position') is 'static'
        trigger.css 'position', 'relative'

      # Trigger should stay on top of the overlay
      unless trigger.data dataZIndex
        trigger.data dataZIndex, trigger.css 'zIndex'

      trigger.css 'zIndex', triggerOptions.tourHighlightZIndex + 1

      # Show overlay
      tourOverlay
        .fadeTo triggerOptions.tourHighlightFadeDuration, triggerOptions.tourHighlightOpacity
    else if $overlay
      hideTourOverlay triggerOptions

    popupContent = content or triggerData.hint
    # If referenced content element is defined, use it's content
    if triggerOptions.referencedContent and not content
      popupContent = $(triggerOptions.referencedContent).clone(true, true) or popupContent

    popupPosition = if isElementFixed trigger then 'fixed' else 'absolute'

    if shownId isnt triggerData.id
      popup.hide 0

    # Update tip content and remove all classes
    popup
      .data(dataBeingShown, true)
      .data(dataShown, triggerData.id)
      .data(dataPosition, popupPosition)
      .find('.' + classContent).empty().append popupContent

    # Check if trigger has fixed position
    popup.css 'position', popupPosition

    # Queue the next refresh
    queueRefreshPosition 0

  isElementFixed = (element) ->
    elemToCheck = element
    while elemToCheck.length and elemToCheck[0].nodeName isnt 'HTML'
      if elemToCheck.css('position') is 'fixed'
        return true
      elemToCheck = elemToCheck.parent()
    false

  triggerMouseover = ->
    trigger = popup = $ @
    isTrigger = trigger.hasClass classInitialized
    unless isTrigger
      trigger = getTrigger popup.data(dataShown)

    return unless trigger.length
    triggerData = trigger.data classBase
    popup = triggerData.popupInstance
      .data (if isTrigger then dataTriggerHovered else dataPopupHovered), true
    killTimers popup
    shownId = popup.data dataShown

    # We should have a valid id and an active trigger by now
    if shownId isnt triggerData.id or popup.css('opacity') is 0
      triggerData.options.onBeforeShow? trigger
      popup
        .data dataTimerShow, setTimeout ->
            showPopup trigger
          , triggerData.options.popupDelay

  triggerMouseout = ->
    trigger = popup = $ @
    isTrigger = trigger.hasClass classInitialized
    unless isTrigger
      trigger = getTrigger popup.data(dataShown)

    return unless trigger.length
    triggerData = trigger.data classBase
    popup = triggerData.popupInstance
      .data (if isTrigger then dataTriggerHovered else dataPopupHovered), false
    killTimers popup

    # Hide tip after a while
    popupData = popup.data()
    unless popupData[dataPopupHovered] or popupData[dataTriggerHovered]
      triggerData.options.onBeforeHide? trigger
      popup
        .data dataTimerHide, setTimeout ->
            hideSmallipop popup
          , triggerData.options.hideDelay

  onWindowScroll = (e) ->
    clearTimeout scrollTimer
    scrollTimer = setTimeout forceRefreshPosition, 250

  setContent = (trigger, content) ->
    return unless trigger?.length
    triggerData = trigger.data classBase
    partOfTour = triggerData.tourTitle

    if partOfTour
      popupContent = triggerData.popupInstance.find('.' + classTourContent)
    else
      popupContent = triggerData.popupInstance.find('.' + classContent)

    if popupContent.html() isnt content
      popupContent
        .stop(true)
        .fadeTo triggerData.options.contentAnimationSpeed, 0, ->
          $(@)
            .html(content)
            .fadeTo triggerData.options.contentAnimationSpeed, 1
          refreshPosition()

  runTour = (trigger, step) ->
    triggerData = trigger.data classBase
    tourTitle = triggerData?.tourTitle
    return unless tourTitle and tours[tourTitle]

    # Sort tour elements before running by their index
    tours[tourTitle].sort (a, b) ->
      a.index - b.index

    # Check if a valid step as array index was provided
    unless typeof step is 'number' and step % 1 is 0
      step = -1
    else
      step -= 1

    currentTour = tourTitle
    currentTourItems = tours[tourTitle]
    for i in [0..currentTourItems.length - 1] when \
        (step >= 0 and i is step) \
        or (step < 0 and currentTourItems[i].id is triggerData.id)
      return tourShow tourTitle, i

  tourShow = (title, index) ->
    currentTourItems = tours[title]
    return unless currentTourItems

    $trigger = currentTourItems[index].trigger
    triggerData = $trigger.data classBase
    options = triggerData.options
    navigationEnabled = options.tourNavigationEnabled

    navigation = ''

    if navigationEnabled
      navigation += "<div class='#{classTourProgress}'>" +
                    "#{index + 1} #{options.labels.of} #{currentTourItems.length}</div>"
      if index > 0
        navigation += "<a href='#' class='#{classTourPrev}'>#{options.labels.prev}</a>"
      if index < currentTourItems.length - 1
        navigation += "<a href='#' class='#{classTourNext}'>#{options.labels.next}</a>"

    if not navigationEnabled or index is currentTourItems.length - 1
      navigation += "<a href='#' class='#{classTourClose}'>#{options.labels.close}</a>"

    $content = $ "<div class='#{classTourContent}'/>" +
      "<a href='#' class='#{classTourCloseIcon}'>&Chi;</a>" +
      "<div class='#{classTourFooter}'>#{navigation}</div>"

    # Append hint object to tour content
    $content.eq(0).append triggerData.hint

    killTimers triggerData.popupInstance
    triggerData.popupInstance.data dataTriggerHovered, true

    # Scroll to trigger if it isn't visible
    showWhenVisible $trigger, $content

  showWhenVisible = ($trigger, content) ->
    targetPosition = $trigger.offset().top
    offset = targetPosition - $document.scrollTop()
    windowHeight = $window.height()
    triggerOptions = $trigger.data(classBase).options

    # First scroll to trigger then show tour
    if not isElementFixed($trigger) and (offset < triggerOptions.autoscrollPadding or offset > windowHeight - triggerOptions.autoscrollPadding)
      $('html, body').animate
          scrollTop: targetPosition - windowHeight / 2
        , 800, 'swing', ->
          showPopup $trigger, content
    else
      showPopup $trigger, content

  tourNext = (e) ->
    e?.preventDefault()
    currentTourItems = tours[currentTour]
    return unless currentTourItems

    # Get currently shown tour item
    $popup = currentTourItems[0].popupInstance
    shownId = $popup.data(dataShown) or currentTourItems[0].id

    for i in [0..currentTourItems.length - 2] when currentTourItems[i].id is shownId
      triggerOptions = currentTourItems[i].trigger.data(classBase).options

      if triggerOptions.tourNavigationEnabled
        triggerOptions.onTourNext?(currentTourItems[i + 1].trigger)
        return tourShow currentTour, i + 1

  tourPrev = (e) ->
    e?.preventDefault()
    currentTourItems = tours[currentTour]
    return unless currentTourItems

    # Get currently shown tour item
    $popup = currentTourItems[0].popupInstance
    shownId = $popup.data(dataShown) or currentTourItems[0].id

    for i in [1..currentTourItems.length - 1] when currentTourItems[i].id is shownId
      triggerOptions = currentTourItems[i].trigger.data(classBase).options

      if triggerOptions.tourNavigationEnabled
        triggerOptions.onTourPrev?(currentTourItems[i - 1].trigger)
        return tourShow currentTour, i - 1

  tourClose = (e) ->
    e?.preventDefault()
    $popup = $(e.target).closest ".#{classInstance}"

    hideSmallipop $popup

  destroy = (instances) ->
    instances.each ->
      self = $ @
      data = self.data classBase
      if data
        self
          .unbind(".#{classBase}")
          .data(classBase, {})
          .removeClass filterBaseClass

  onWindowKeyUp = (e) ->
    targetIsInput = e?.target.tagName.toLowerCase() in ['input', 'textarea']

    switch e.which
      # Escape - close all popups
      when 27 then hideSmallipop popup for popupId, popup of instances
      # Arrow left
      when 37 then tourPrev() unless targetIsInput
      # Arrow right
      when 39 then tourNext() unless targetIsInput

  getInstance = (id='default', isTour=false) ->
    return instances[id] if instances[id]

    instance = $(popupTemplate)
      .css('opacity', 0)
      .attr('id', "#{classBase + nextInstanceId++}")
      .addClass(classInstance)
      .data(dataXDistance, 0)
      .data(dataYDistance, 0)
      .data(dataIsTour, isTour)
      .bind(eventMouseOver, triggerMouseover)
      .bind(eventMouseOut, triggerMouseout)

    $('body').append instance

    # Add some binding to events in the popup
    if isTour
      instance
        .delegate(".#{classTourPrev}", eventClick, tourPrev)
        .delegate(".#{classTourNext}", eventClick, tourNext)
        .delegate(".#{classTourClose}, .#{classTourCloseIcon}", eventClick, tourClose)
    else
      instance.delegate('a', eventClick, hideSmallipop)

    # Bind some events to the document and window if we created the first smallipop
    if nextInstanceId is 2
      $document.bind "#{eventClick} #{eventTouchEnd}", hideSmallipop
      $window
        .bind(eventResize, queueRefreshPosition)
        .bind(eventScroll, onWindowScroll)
        .bind(eventKeyUp, onWindowKeyUp)

    instances[id] = instance

  $.fn.smallipop = (options={}, hint='') ->
    # Handle direct method calls
    if typeof(options) is 'string'
      switch options.toLowerCase()
        when 'show' then showSmallipop.call @first().get(0)
        when 'hide' then hideSmallipop @first().get(0)
        when 'destroy' then destroy @
        when 'tour' then runTour @first(), hint
        when 'update' then setContent @first(), hint
      return @

    options = $.extend true, {}, sip.defaults, options

    # Check for enabled css animations and disable if modernizr is active and says no
    unless cssAnimationsEnabled
      options.cssAnimations.enabled = false

    # Initialize smallipop on first call
    $popup = getInstance options.popupId

    return @.each ->
      $self = $ @
      tagName = $self[0].tagName.toLowerCase()
      type = $self.attr 'type'
      triggerData = $self.data()

      # Get content for the popup
      # If it's inline markup, create a deep copy of the hint html
      objHint = hint or $self.attr('title')

      $objInfo = $ "> .#{options.infoClass}:first", $self
      if $objInfo.length
        objHint = $objInfo.clone(true, true).removeClass options.infoClass

      # Initialize each trigger, create id and bind events
      if objHint and not $self.hasClass classInitialized
        newId = lastId++

        triggerEvents = {}
        triggerPopupInstance = $popup
        triggerOptions = $.extend true, {}, options

        # Check if inline smallipop options are provided as object or single data attributes
        if typeof(triggerData[classBase]) is 'object'
          $.extend true, triggerOptions, triggerData[classBase]

        # Extend the trigger options by options set in data attribute
        for option, value of triggerData when option.indexOf(classBase) >= 0
          optionName = option.replace classBase, ''
          if optionName
            optionName = optionName.substr(0, 1).toLowerCase() + optionName.substr(1)
            triggerOptions[optionName] = value

        isFormElement = triggerOptions.handleInputs \
          and tagName in ['input', 'select', 'textarea']

        # Add to tours if tourTitle is set
        if triggerOptions.tourIndex
          tourTitle = triggerOptions.tourTitle or 'defaultTour'

          # Disable all trigger events
          triggerOptions.hideOnTriggerClick = triggerOptions.hideOnPopupClick = false
          triggerPopupInstance = getInstance tourTitle, true

          tours[tourTitle] = [] unless tours[tourTitle]
          tours[tourTitle].push
            index: triggerOptions.tourIndex or 0
            id: newId
            trigger: $self
            popupInstance: triggerPopupInstance
        else
          touchTrigger = triggerOptions.touchSupport and touchEnabled

          # Activate on blur events if used on inputs and disable hide on click
          if isFormElement
            # Don't hide when trigger is clicked and show when trigger is clicked
            triggerOptions.hideOnTriggerClick = false
            triggerEvents[eventFocus] = triggerMouseover
            triggerEvents[eventBlur] = triggerMouseout
          else if not touchTrigger
            triggerEvents[eventMouseOut] = triggerMouseout

          # Check whether the trigger should activate smallipop by click or hover
          if triggerOptions.triggerOnClick or touchTrigger
            triggerEvents[eventClick] = showSmallipop
          else
            triggerEvents[eventClick] = triggerMouseout
            triggerEvents[eventMouseOver] = triggerMouseover

        # Store parameters for this trigger
        $self
          .addClass("#{classInitialized} #{classBase}#{newId}")
          .attr('title', '') # Remove title to disable browser hint
          .data classBase,
            id: newId
            hint: objHint
            options: triggerOptions
            tagName: tagName
            type: type
            tourTitle: tourTitle
            popupInstance: triggerPopupInstance
            isFormElement: isFormElement
          .bind triggerEvents

        # Hide popup when links contained in the trigger are clicked
        unless triggerOptions.hideOnTriggerClick
          $self.delegate 'a', eventClick, hideSmallipop
))
