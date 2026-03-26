// Jest setup — stub out requestAnimationFrame and cancelAnimationFrame for jsdom
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
