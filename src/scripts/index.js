'use strict';

$(document).ready(function() {
    $('.slider').slick({
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 4000,
        lazyLoad: 'progressive',
        dots: true
    });
    $('#menu-btn').click(function() {
        $('#menu').toggleClass('active');
    });
});