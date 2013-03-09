(($) ->
  ### Enable prettyprint ###
  window.prettyPrint?()

  ### Init Smallipops ###
  $('.smallipop').smallipop
    theme: 'black wide'
    cssAnimations:
      enabled: true

  $('#startExample1').click ->
    $('#example1 .smallipop').smallipop 'tour'
)(jQuery)
