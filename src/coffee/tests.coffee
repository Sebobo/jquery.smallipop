###!
Test suite for jQuery Smallipop
###

$('.smallipop').smallipop()

test 'Smallipop exists', ->
  smallipop = $ '.smallipop-instance'

  # Test existance of rondell
  equal smallipop.length, 1, 'Smallipop instance should exist'

  equal smallipop.attr('id'), 'smallipop1', 'First smallipop should have id 1'


asyncTest 'Show tooltip', ->
  smallipop = $ '.smallipop-instance'
  trigger = $ '.smallipop:first'

  # Check if lightbox is created and shown by calling the api
  trigger.smallipop 'show'

  # Try closing the smallipop by clicking the document
  setTimeout( ->
    ok smallipop.is(':visible'), 'Smallipop should be visible'

    $(document).trigger 'click'

    setTimeout( ->
      equal smallipop.css('display'), 'none', 'Smallipop should now be hidden'

      # Resume testrunner
      start()
    , 300)
  , 100)
