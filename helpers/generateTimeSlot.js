function generateTimeSlots(activeTiming) {
    const startTime = new Date(`01/01/2022 ${activeTiming.from}`);
    const endTime = new Date(`01/01/2022 ${activeTiming.to}`);
    const slotWidth = parseInt(activeTiming.slotWidth, 10);
    const timeArray = [];

    let currentTime = startTime;

    while (currentTime < endTime) {
        const formattedTime = currentTime.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });
        timeArray.push({ time: formattedTime, bookedNumber: 0 });
        currentTime.setMinutes(currentTime.getMinutes() + slotWidth);
    }

    console.log(timeArray);
    return timeArray;
}

module.exports = generateTimeSlots;