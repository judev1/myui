const fadeSeconds = 0.2
const fadeMilliseconds = fadeSeconds * 1000;

async function fadeIn(element) {
    return new Promise((resolve) => {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
        setTimeout(() => {
            resolve();
        }, fadeMilliseconds);
    });
}

async function fadeOut(element) {
    return new Promise((resolve) => {
        element.style.opacity = '0';
        element.style.pointerEvents = 'none';
        setTimeout(() => {
            resolve();
        }, fadeMilliseconds);
    });
}

function makeFadable(element) {
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
    var transition = getComputedStyle(element).getPropertyValue('transition');
    if (transition) {
        element.style.transition = `${transition}, opacity ${fadeSeconds}s ease-in-out`;
    } else {
        element.style.transition = `opacity ${fadeSeconds}s ease-in-out`;
    }
}