const { isNumeric } = require("validator");

const timeFormatRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;

function validateTimeFormat(time) {
    return timeFormatRegex.test(time);
}

function validateActiveTiming(activeTiming) {
    const { from, to, slotWidth } = activeTiming;
    if(!from || !to || !slotWidth) {
        return false;
    }else{
        if (!validateTimeFormat(from) || !validateTimeFormat(to)) {
            return false;
        };
        if (!(Number(slotWidth) && slotWidth > 0)) {
            return false;
        }
        return true;
    }
}
module.exports = validateActiveTiming;