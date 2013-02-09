/*!
Test suite for jQuery Smallipop
*/

$('.smallipop').smallipop();

test('Smallipop exists', function() {
  var smallipop;
  smallipop = $('.smallipop-instance');
  equal(smallipop.length, 1, 'Smallipop instance should exist');
  return equal(smallipop.attr('id'), 'smallipop1', 'First smallipop should have id 1');
});

asyncTest('Show tooltip', function() {
  var smallipop, trigger;
  smallipop = $('.smallipop-instance');
  trigger = $('.smallipop:first');
  trigger.smallipop('show');
  return setTimeout(function() {
    ok(smallipop.is(':visible'), 'Smallipop should be visible');
    $(document).trigger('click');
    return setTimeout(function() {
      equal(smallipop.css('display'), 'none', 'Smallipop should now be hidden');
      return start();
    }, 300);
  }, 100);
});
