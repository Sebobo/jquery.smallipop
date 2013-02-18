###!
Test suite for jQuery Smallipop
###

# Prepare test suite

$('.smallipop').smallipop()

$('.run-tour').click ->
  $('.smallipop-tour').smallipop 'tour'

# Run test suite
module 'core'

test 'Smallipop exists', ->
  expect 2
  smallipop = $ '.smallipop-instance:first'

  # Test existance of rondell
  equal smallipop.length, 1, 'Smallipop instance should exist'

  equal smallipop.attr('id'), 'smallipop1', 'First smallipop should have id 1'


module 'interaction'

asyncTest 'Show and hide tooltip by interaction', ->
  expect 2
  smallipop = $ '#smallipop1'
  trigger = $ '.smallipop:first'

  # Check if lightbox is created and shown by calling the api
  trigger.trigger 'mouseenter'

  # Try closing the smallipop by clicking the document
  setTimeout( ->
    ok smallipop.is(':visible'), 'Smallipop should be visible'

    $(document).trigger 'click'

    setTimeout( ->
      equal smallipop.css('display'), 'none', 'Smallipop should now be hidden'

      # Resume testrunner
      start()
    , 300)
  , 200)


module 'api'

asyncTest 'Show and hide tooltip with api', ->
  expect 2
  smallipop = $ '#smallipop1'
  trigger = $ '.smallipop:first'

  # Check if lightbox is created and shown by calling the api
  trigger.smallipop 'show'

  # Try closing the smallipop by clicking the document
  setTimeout( ->
    ok smallipop.is(':visible'), 'Smallipop should be visible'

    trigger.smallipop 'hide'

    setTimeout( ->
      equal smallipop.css('display'), 'none', 'Smallipop should now be hidden'

      # Resume testrunner
      start()
    , 300)
  , 200)


asyncTest 'Change tooltip content with api', ->
  expect 2
  smallipop = $ '#smallipop1'
  trigger = $ '.smallipop:first'

  oldHint = trigger.data('smallipop').hint
  newHint = 'some fancy new hint'

  notEqual oldHint, newHint, 'Old and new content are different'

  # Update the smallipop hint
  trigger.smallipop 'update', newHint

  setTimeout ->
      equal $('.sipContent', smallipop).text(), newHint, 'Hint should have changed'

      # Resume testrunner
      start()
    , 200

asyncTest 'Run tour', ->
  expect 2
  smallipopTour = $ '#smallipop2'

  $('.smallipop-tour').smallipop 'tour'

  setTimeout( ->
    ok $('.smallipop-tour-progress', smallipopTour).text().indexOf('1 of 2') > 0, 'Tour should start at the first element'

    $('.smallipop-tour').smallipop 'tour', 2

    setTimeout( ->
      ok $('.smallipop-tour-progress', smallipopTour).text().indexOf('2 of 2') > 0, 'Tour with startindex 2 should start at the second element'
      # Resume testrunne
      start()
    , 200)
  , 200)
