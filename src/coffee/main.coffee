hostname = document.location.hostname
develop = !(hostname and (hostname.indexOf('github') >= 0 or hostname.indexOf('sebastianhelzle') >= 0))

requirejs.config
  urlArgs: if develop then 'bust=' + (new Date()).getTime() else ''
  paths:
    jquery: "contrib/jquery.min"
    prettify: "contrib/prettify"
    smallipop: "jquery.smallipop"
    piwik: "https://tracking.sebastianhelzle.net/piwik"

# Load modernizr and the demo initialization module
requirejs ['jquery', 'prettify', 'piwik', 'smallipop'], ($) ->
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
    theme: 'blue fat-shadow'
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
    theme: 'white white-transparent'
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
    popupId: 'form'

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

  # Piwik tracking
  unless develop
    try
      piwikTracker = Piwik.getTracker 'https://tracking.sebastianhelzle.net/piwik.php', 5
      piwikTracker.trackPageView()
      piwikTracker.enableLinkTracking()
    catch err
