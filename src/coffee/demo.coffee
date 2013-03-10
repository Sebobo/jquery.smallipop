###
General demo helpers for smallipop
###

(($) ->
  # Floating side menu
  sideMenu = $ '.side-menu'
  sideMenuItems = $ 'a', sideMenu
  sideMenuMinY = $('.page').position().top
  lastSideMenuY = -1
  currentSideMenuItem = 0

  ### Enable prettyprint ###
  window.prettyPrint?()

  ### Collapsable contentelements ###
  $('.collapsor').click (e) ->
    e.preventDefault()
    self = $ @
    self.slideUp 300, ->
      $(self.attr('href')).slideDown 300

  ### Smooth scroller for menu ###
  $('.scrollToId').click (e) ->
    e.preventDefault()
    $('html, body').animate
        scrollTop: $($(@).attr('href')).offset().top
      , 800, 'swing'

  ### Smallipop creation calls ###
  $('.smallipop').smallipop()

  $('.smallipopOrange').smallipop
    theme: 'orange'

  $('.smallipopBlack').smallipop
      theme: 'black'

  $('.smallipopHideBlack').smallipop
      theme: 'black'
      hideTrigger: true

  $('.smallipopBlue').smallipop
    theme: 'blue'
    invertAnimation: true

  $('.smallipopBlueFatShadow').smallipop
    theme: 'blue fatShadow'
    invertAnimation: true

  $('.smallipopHideBlue').smallipop
    theme: 'blue'
    hideTrigger: true
    popupYOffset: 40
    invertAnimation: true

  $('.smallipopWhite').smallipop
    theme: 'white'

  $('.smallipopHide').smallipop
    hideTrigger: true
    theme: 'white'
    popupYOffset: 5

  $('.smallipopHideTrans').smallipop
    hideTrigger: true
    theme: 'white whiteTransparent'
    popupYOffset: 20

  $('.smallipopStatic').smallipop
    theme: 'black'
    popupDistance: 0
    popupYOffset: -14
    popupAnimationSpeed: 100

  $('.smallipopBottom').smallipop
    theme: 'black'
    preferredPosition: 'bottom'

  $('.smallipopHorizontal').smallipop
    preferredPosition: 'right'
    theme: 'black'
    popupOffset: 10
    invertAnimation: true

  $('.smallipopFormElement').smallipop
    preferredPosition: 'right'
    theme: 'black'
    popupOffset: 0
    triggerOnClick: true

  $('#tipcustomhint').smallipop {}, "I'm the real hint!"

  $(document).delegate '#tipkiller', 'click', (e) ->
    e.preventDefault()
    $('#ajaxContainer').html '<div>Some new content</div>'

  $(document).delegate '#tipkiller2', 'click', (e) ->
    e.preventDefault()
    $('#ajaxContainer2').html '<div>Some new content</div>'

  $('#tipChangeContent').smallipop
    onAfterShow: (trigger) ->
      $.smallipop.setContent trigger, "I'm the new content and I have replaced the old boring content!"
    onBeforeHide: (trigger) ->
      $.smallipop.setContent trigger, "Bye bye"

  $('#tipCSSAnimated').smallipop
    cssAnimations:
      enabled: true
      show: 'animated bounceInDown'
      hide: 'animated hinge'

  $('#tipCSSAnimated2').smallipop
    cssAnimations:
      enabled: true
      show: 'animated flipInX'
      hide: 'animated flipOutX'

  $('#tipCSSAnimated3').smallipop
    cssAnimations:
      enabled: true
      show: 'animated fadeInLeft'
      hide: 'animated fadeOutRight'

  $('#tipCSSAnimated4').smallipop
    cssAnimations:
      enabled: true
      show: 'animated rotateInDownLeft'
      hide: 'animated rotateOutUpRight'

  $('#tipDontHideOnTriggerClick').smallipop
      hideOnTriggerClick: false

  $('#tipDontHideOnContentClick').smallipop
      hideOnPopupClick: false

  ### Tour stuff ###
  $('.smallipopTour').smallipop
    theme: 'black wide'
    cssAnimations:
      enabled: true
      show: 'animated fadeIn'
      hide: 'animated fadeOut'

  $('#runTour').click ->
    $('.smallipopTour').smallipop 'tour'

  $('#startExample1').click (e) ->
    e.preventDefault()
    $('#example2 .smallipopTour').smallipop 'tour'

  ### Animate smallipops when scrolling ###
  if $('.wobbler').length
    $(document).scroll ->
      $wobblers = $ '.wobbler:not(.wobble)'
      $win = $ window
      winHeight = $win.height()
      scrollTop = $win.scrollTop()

      $wobblers.each ->
        $self = $ @
        offset = $self.offset()
        if offset.top > scrollTop + 50 and offset.top < scrollTop - 50 + winHeight
          $self.addClass 'wobble'
    .trigger 'scroll'

  ### Special 3rd party script calls ###
  hostname = document.location.hostname
  if hostname and (hostname.indexOf('github') >= 0 or hostname.indexOf('sebastianhelzle') >= 0)
    # Piwik tracking
    try
        piwikTracker = Piwik.getTracker pkBaseURL + "piwik.php", 5
        piwikTracker.trackPageView()
        piwikTracker.enableLinkTracking()
    catch err

    # Addthis code
    document.write unescape("%3Cscript src='http://s7.addthis.com/js/250/addthis_widget.js#pubid=sebobo' type='text/javascript'%3E%3C/script%3E")

    # Flattr button
    s = document.createElement 'script'
    t = document.getElementsByTagName('script')[0]
    s.type = 'text/javascript'
    s.async = true
    s.src = 'http://api.flattr.com/js/0.6/load.js?mode=auto'
    t.parentNode.insertBefore s, t

)(jQuery)
