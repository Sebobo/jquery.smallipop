###!
Test suite for jQuery Smallipop
###

# Prepare test suite
$('.smallipop').smallipop
  theme: 'black'
  touchSupport: false

$('.run-tour').click ->
  $('.smallipop-tour').smallipop 'tour'

delayCall = (delay, callback) -> setTimeout callback, delay

defaultDelay = 1000

#$.fx.off = true

###
Test the core plugin features
###
module 'core'

test 'Smallipop exists', ->
  expect 2
  smallipop = $ '.smallipop-instance:first'

  # Test existance of rondell
  equal smallipop.length, 1, 'Smallipop instance should exist'

  equal smallipop.attr('id'), 'smallipop1', 'First smallipop should have id 1'


###
Test interaction with the plugins ui elements
###
module 'interaction'

asyncTest 'Show and hide tooltip by interaction', ->
  expect 2
  smallipop = $ '#smallipop1'
  trigger = $ '.smallipop:first'

  # Check if plugin is shown by hovering the trigger
  trigger.mouseover()

  delayCall defaultDelay, ->
    ok smallipop.is(':visible'), 'Smallipop should be visible'

    # Try closing the smallipop by clicking the document
    $(document).click()

    delayCall defaultDelay, ->
      equal smallipop.css('display'), 'none', 'Smallipop should now be hidden'

      # Resume testrunner
      start()

###
Test direct calls to the plugins api
###
module 'api'

asyncTest 'Show and hide tooltip with api', ->
  expect 2
  smallipop = $ '#smallipop1'
  trigger = $ '.smallipop:first'

  # Check if smallipop shows up by calling the api
  trigger.smallipop 'show'

  # Try closing the smallipop by clicking the document
  delayCall defaultDelay, ->
    ok smallipop.is(':visible'), 'Smallipop should be visible'

    trigger.smallipop 'hide'

    delayCall defaultDelay, ->
      equal smallipop.css('display'), 'none', 'Smallipop should now be hidden'

      # Resume testrunner
      start()


asyncTest 'Change tooltip content with api', ->
  expect 2
  smallipop = $ '#smallipop1'
  trigger = $ '.smallipop:first'

  oldHint = trigger.data('smallipop').hint
  newHint = 'some fancy new hint'

  notEqual oldHint, newHint, 'Old and new content are different'

  trigger.smallipop 'show'

  # Update the smallipop hint
  trigger.smallipop 'update', newHint

  delayCall defaultDelay, ->
    equal $('.smallipop-content', smallipop).text(), newHint, 'Hint should have changed'

    # Resume testrunner
    start()

###
Test the plugins tour feature
###
module 'tour'

asyncTest 'Run tour', ->
  expect 2
  smallipopTour = $ '#smallipop2'

  $('.smallipop-tour[data-smallipop-tour-index="1"]').smallipop('tour')

  delayCall defaultDelay, ->
    equal $('.smallipop-tour-progress', smallipopTour).text(), '1 of 2', 'Tour should start at the selected element when no index is provided'

    $('.smallipop-tour').smallipop 'tour', 2

    delayCall defaultDelay, ->
      equal $('.smallipop-tour-progress', smallipopTour).text(), '2 of 2', 'Tour with startindex 2 should start at the second element'
      # Resume testrunner
      start()
