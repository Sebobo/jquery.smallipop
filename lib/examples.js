
(function($) {
  /* Enable prettyprint
  */
  if (typeof window.prettyPrint === "function") {
    window.prettyPrint();
  }
  /* Init Smallipops
  */

  $('.smallipop').smallipop({
    theme: 'black wide',
    cssAnimations: {
      enabled: true
    }
  });
  return $('#startExample1').click(function() {
    return $('#example1 .smallipop').smallipop('tour');
  });
})(jQuery);
