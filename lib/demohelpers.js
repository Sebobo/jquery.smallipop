/* General demo helpers */
$(function() {    
    // Floating side menu
    var sideMenu = $(".side-menu"),
        sideMenuItems = $("a", sideMenu),
        sideMenuMinY = $(".page").position().top,
        lastSideMenuY = -1,
        currentSideMenuItem = 0;
    
    $(window).scroll(function(e) {
        var scrollY = $(document).scrollTop();
        
        if (scrollY == lastSideMenuY)
            return;
            
        lastSideMenuY = scrollY;
        
        // Move floating menu
        if (scrollY > sideMenuMinY) {
            sideMenu.css({
                position: "fixed",
                top: 0
            });
        } else {
            sideMenu.css({
                position: "absolute",
                top: sideMenuMinY
            });
        }
        
        // Check where we are in the document
        var currentItem = 0, itemY = 0;
        for (var i = 0; i < sideMenuItems.length; i++) {
            itemY = $(sideMenuItems.eq(i).attr("href")).position().top;
            if (itemY < scrollY)
                currentItem = i;
            else
                break;
        }
        
        // Switch current menu item                    
        if (currentSideMenuItem != currentItem) {
            currentSideMenuItem = currentItem;
            
            // Remove current class from inactive items
            sideMenuItems.not(":eq(" + currentItem + ")").removeClass("current");
            // Highlight current item
            sideMenuItems.eq(currentItem).addClass("current");
        }
    }).trigger("scroll");
    
    // Collapsable contentelements
    $('.collapsor').click(function(e) {
        e.preventDefault();
        var self = $(this);
        self.slideUp(300, function() {
            $(self.attr('href')).slideDown(300); 
        });
    });
    
    // Smooth scroller for menu
    $('.scrollToId').click(function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top
        }, 800, 'swing');   
    });
});
