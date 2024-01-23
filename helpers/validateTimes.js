const timeFormatRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;

function validateTimeFormat(time) {
    return timeFormatRegex.test(time);
}

function validateActiveTiming(activeTiming) {
    const { from, to } = activeTiming;

    if (!validateTimeFormat(from) || !validateTimeFormat(to)) {
        return false;
    };
    return true;
}
module.exports = validateActiveTiming;