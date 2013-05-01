/*!
Test suite for jQuery Smallipop
*/

var defaultDelay, delayCall;

$('.smallipop').smallipop({
  theme: 'black',
  touchSupport: false
});

$('.run-tour').click(function() {
  return $('.smallipop-tour').smallipop('tour');
});

delayCall = function(delay, callback) {
  return setTimeout(callback, delay);
};

defaultDelay = 1000;

/*
Test the core plugin features
*/


module('core');

test('Smallipop exists', function() {
  var smallipop;
  expect(2);
  smallipop = $('.smallipop-instance:first');
  equal(smallipop.length, 1, 'Smallipop instance should exist');
  return equal(smallipop.attr('id'), 'smallipop1', 'First smallipop should have id 1');
});

/*
Test interaction with the plugins ui elements
*/


module('interaction');

asyncTest('Show and hide tooltip by interaction', function() {
  var smallipop, trigger;
  expect(2);
  smallipop = $('#smallipop1');
  trigger = $('.smallipop:first');
  trigger.mouseover();
  return delayCall(defaultDelay, function() {
    ok(smallipop.is(':visible'), 'Smallipop should be visible');
    $(document).click();
    return delayCall(defaultDelay, function() {
      equal(smallipop.css('display'), 'none', 'Smallipop should now be hidden');
      return start();
    });
  });
});

/*
Test direct calls to the plugins api
*/


module('api');

asyncTest('Show and hide tooltip with api', function() {
  var smallipop, trigger;
  expect(2);
  smallipop = $('#smallipop1');
  trigger = $('.smallipop:first');
  trigger.smallipop('show');
  return delayCall(defaultDelay, function() {
    ok(smallipop.is(':visible'), 'Smallipop should be visible');
    trigger.smallipop('hide');
    return delayCall(defaultDelay, function() {
      equal(smallipop.css('display'), 'none', 'Smallipop should now be hidden');
      return start();
    });
  });
});

asyncTest('Change tooltip content with api', function() {
  var newHint, oldHint, smallipop, trigger;
  expect(2);
  smallipop = $('#smallipop1');
  trigger = $('.smallipop:first');
  oldHint = trigger.data('smallipop').hint;
  newHint = 'some fancy new hint';
  notEqual(oldHint, newHint, 'Old and new content are different');
  trigger.smallipop('show');
  trigger.smallipop('update', newHint);
  return delayCall(defaultDelay, function() {
    equal($('.sipContent', smallipop).text(), newHint, 'Hint should have changed');
    return start();
  });
});

/*
Test the plugins tour feature
*/


module('tour');

asyncTest('Run tour', function() {
  var smallipopTour;
  expect(2);
  smallipopTour = $('#smallipop2');
  $('.smallipop-tour').smallipop('tour');
  return delayCall(defaultDelay, function() {
    ok($('.smallipop-tour-progress', smallipopTour).text().indexOf('1 of 2') > 0, 'Tour should start at the first element');
    $('.smallipop-tour').smallipop('tour', 2);
    return delayCall(defaultDelay, function() {
      ok($('.smallipop-tour-progress', smallipopTour).text().indexOf('2 of 2') > 0, 'Tour with startindex 2 should start at the second element');
      return start();
    });
  });
});
