// Глобальная переменная
let lenis;
const marquees = document.querySelectorAll(".marquee");
const mm = gsap.matchMedia();

document.addEventListener('DOMContentLoaded', function() {
    initLenis();
    initModals();
    
    mm.add({
            isMobile: "(max-width: 699px)",
            isDesktop: "(min-width: 700px)"
        },
        (context) => {
            const { isMobile, isDesktop } = context.conditions;

            marquees.forEach((marquee) => {
                const marqueeItems = marquee.querySelectorAll(".marquee-item");
                const reversed =
                    marquee.getAttribute("data-reversed") === "true" ? true : false;

                horizontalLoop(marqueeItems, {
                    repeat: -1,
                    paddingRight: isDesktop ? 40 : 20,
                    speed: isDesktop ? 0.5 : 0.25,
                    reversed
                });
            });
        }
    );
});

function initLenis() {
    // Создаем единственный экземпляр
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        autoRaf: true,
        prevent: (node) => node.closest('.modal__scroll')
    });
    
    window.lenis = lenis;
    
    // Анкоры
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target);
            }
        });
    });
    
    // RAF
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// Убрал дублирование const lenis = new Lenis();
function initModals() {
    // Get all open buttons and modal elements
    const openButtons = document.querySelectorAll("[data-modal-open]:not([data-modal-open^='modal-reviews-'])");
    const closeButtons = document.querySelectorAll("[data-modal-close]");
    const modals = document.querySelectorAll(".modal:not(#dynamic-video-modal)");
    
    // Add click event to all open buttons
    openButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const modalId = button.getAttribute("data-modal-open");
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add('is-active');
                document.body.classList.add('modal-open'); // Блокируем скролл body
                console.log(`Modal ${modalId} opened`);
                lenis.stop(); // Останавливаем Lenis полностью
            }
        });
    });
    
    // Add click event to all close buttons
    closeButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const parentModal = button.closest('.modal');
            if (parentModal) {
                parentModal.classList.remove('is-active');
                console.log(`Modal ${parentModal.id} closed`);
                if (!document.querySelector('.modal.is-active')) {
                    document.body.classList.remove('modal-open'); // Разблокируем скролл body
                    lenis.start(); // Запускаем Lenis обратно
                }
            }
        });
    });
    
    // Close modal when clicking outside content area
    modals.forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove('is-active');
                console.log(`Modal ${modal.id} closed by outside click`);
                if (!document.querySelector('.modal.is-active')) {
                    document.body.classList.remove('modal-open'); // Разблокируем скролл body
                    lenis.start(); // Запускаем Lenis обратно
                }
            }
        });
    });
}

/**************************************************************
* Header / Menu burger
**************************************************************/
const body = document.querySelector('body');
const burger = document.querySelector('.burger');
const closeButton = document.querySelector('.burger__close');
const overlay = document.querySelector('.overlay');
const menu = document.querySelectorAll('.mobile__menu');
const links = document.querySelectorAll('.mobile__menu .header__nav a');
const langLinks = document.querySelectorAll('.language-chooser a');

// Установка начального состояния меню и кнопки закрыть
gsap.set(menu, {
    y: -100,
    autoAlpha: 0
});

gsap.set(closeButton, {
    y: 50,
    autoAlpha: 0
});

function toggleMobileMenu() {
    if (!burger.classList.contains('is-active')) {
        // Открываем меню
        burger.classList.add('is-active');
        overlay.classList.add('is-active');
        closeButton.classList.add('is-active');
        body.classList.add('overflow');
        
        // Анимация меню
        gsap.to(menu, { 
            y: 0,
            autoAlpha: 1,
            duration: 0.4,
            ease: "power2.out"
        });
        
        // Анимация кнопки закрыть
        gsap.to(closeButton, {
            y: 0,
            autoAlpha: 1,
            duration: 0.3,
            delay: 0.2,
            ease: "power2.out"
        });
        
    } else {
        // Закрываем меню
        burger.classList.remove('is-active');
        overlay.classList.remove('is-active');
        closeButton.classList.remove('is-active');
        body.classList.remove('overflow');
        
        // Анимация кнопки закрыть
        gsap.to(closeButton, {
            y: 50,
            autoAlpha: 0,
            duration: 0.2,
            ease: "power2.in"
        });
        
        // Анимация меню
        gsap.to(menu, { 
            y: -100,
            autoAlpha: 0,
            duration: 0.2,
            // delay: 0.1,
            ease: "power2.in"
        });
    }
}

// Обработчики событий
closeButton.addEventListener('click', e => {
    e.preventDefault();
    toggleMobileMenu();
});

burger.addEventListener('click', e => {
    e.preventDefault();
    toggleMobileMenu();
});

function horizontalLoop(items, config) {
    items = gsap.utils.toArray(items);
    config = config || {};
    let tl = gsap.timeline({
            repeat: config.repeat,
            paused: config.paused,
            defaults: { ease: "none" },
            onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)
        }),
        length = items.length,
        startX = items[0].offsetLeft,
        times = [],
        widths = [],
        xPercents = [],
        curIndex = 0,
        pixelsPerSecond = (config.speed || 1) * 100,
        snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
        totalWidth,
        curX,
        distanceToStart,
        distanceToLoop,
        item,
        i;
    gsap.set(items, {
        // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
        xPercent: (i, el) => {
            let w = (widths[i] = parseFloat(gsap.getProperty(el, "width", "px")));
            xPercents[i] = snap(
                (parseFloat(gsap.getProperty(el, "x", "px")) / w) * 100 +
                gsap.getProperty(el, "xPercent")
            );
            return xPercents[i];
        }
    });
    gsap.set(items, { x: 0 });
    totalWidth =
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        items[length - 1].offsetWidth *
        gsap.getProperty(items[length - 1], "scaleX") +
        (parseFloat(config.paddingRight) || 0);
    for (i = 0; i < length; i++) {
        item = items[i];
        curX = (xPercents[i] / 100) * widths[i];
        distanceToStart = item.offsetLeft + curX - startX;
        distanceToLoop =
            distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
        tl.to(
                item, {
                    xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
                    duration: distanceToLoop / pixelsPerSecond
                },
                0
            )
            .fromTo(
                item, {
                    xPercent: snap(
                        ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
                    )
                }, {
                    xPercent: xPercents[i],
                    duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                    immediateRender: false
                },
                distanceToLoop / pixelsPerSecond
            )
            .add("label" + i, distanceToStart / pixelsPerSecond);
        times[i] = distanceToStart / pixelsPerSecond;
    }

    function toIndex(index, vars) {
        vars = vars || {};
        Math.abs(index - curIndex) > length / 2 &&
            (index += index > curIndex ? -length : length); // always go in the shortest direction
        let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];
        if (time > tl.time() !== index > curIndex) {
            // if we're wrapping the timeline's playhead, make the proper adjustments
            vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
            time += tl.duration() * (index > curIndex ? 1 : -1);
        }
        curIndex = newIndex;
        vars.overwrite = true;
        return tl.tweenTo(time, vars);
    }
    tl.next = (vars) => toIndex(curIndex + 1, vars);
    tl.previous = (vars) => toIndex(curIndex - 1, vars);
    tl.current = () => curIndex;
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true); // pre-render for performance
    if (config.reversed) {
        tl.vars.onReverseComplete();
        tl.reverse();
    }
    return tl;
}