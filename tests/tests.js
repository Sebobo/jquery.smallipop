/*!
Test suite for jQuery Smallipop
*/

$('.smallipop').smallipop();

$('.run-tour').click(function() {
  return $('.smallipop-tour').smallipop('tour');
});

test('Smallipop exists', function() {
  var smallipop;
  smallipop = $('.smallipop-instance:first');
  equal(smallipop.length, 1, 'Smallipop instance should exist');
  return equal(smallipop.attr('id'), 'smallipop1', 'First smallipop should have id 1');
});

asyncTest('Show and hide tooltip by interaction', function() {
  var smallipop, trigger;
  smallipop = $('#smallipop1');
  trigger = $('.smallipop:first');
  trigger.trigger('mouseenter');
  return setTimeout(function() {
    ok(smallipop.is(':visible'), 'Smallipop should be visible');
    $(document).trigger('click');
    return setTimeout(function() {
      equal(smallipop.css('display'), 'none', 'Smallipop should now be hidden');
      return start();
    }, 300);
  }, 200);
});

asyncTest('Show and hide tooltip with api', function() {
  var smallipop, trigger;
  smallipop = $('#smallipop1');
  trigger = $('.smallipop:first');
  trigger.smallipop('show');
  return setTimeout(function() {
    ok(smallipop.is(':visible'), 'Smallipop should be visible');
    trigger.smallipop('hide');
    return setTimeout(function() {
      equal(smallipop.css('display'), 'none', 'Smallipop should now be hidden');
      return start();
    }, 300);
  }, 200);
});

asyncTest('Change tooltip content with api', function() {
  var newHint, oldHint, smallipop, trigger;
  smallipop = $('#smallipop1');
  trigger = $('.smallipop:first');
  oldHint = trigger.data('smallipop').hint;
  newHint = 'some fancy new hint';
  notEqual(oldHint, newHint, 'Old and new content are different');
  trigger.smallipop('update', newHint);
  return setTimeout(function() {
    equal($('.sipContent', smallipop).text(), newHint, 'Hint should have changed');
    return start();
  }, 200);
});

asyncTest('Run tour', function() {
  var smallipopTour;
  smallipopTour = $('#smallipop2');
  $('.smallipop-tour').smallipop('tour');
  return setTimeout(function() {
    ok($('.smallipop-tour-progress', smallipopTour).text().indexOf('1 of 2') > 0, 'Tour should start at the first element');
    $('.smallipop-tour').smallipop('tour', 2);
    return setTimeout(function() {
      ok($('.smallipop-tour-progress', smallipopTour).text().indexOf('2 of 2') > 0, 'Tour with startindex 2 should start at the second element');
      return start();
    }, 200);
  }, 200);
});
