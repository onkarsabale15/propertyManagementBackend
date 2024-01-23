const formatDate = (date) => {
    console.log(date)
    if (!(date instanceof Date)) {
        throw new Error('Invalid date object');
    }

    // Get the various components of the date
    var day = date.getDate();
    var month = date.getMonth() + 1; // Months are zero-indexed, so add 1
    var year = date.getFullYear();

    // Ensure that single-digit days and months are zero-padded
    var formattedDay = (day < 10 ? '0' : '') + day;
    var formattedMonth = (month < 10 ? '0' : '') + month;

    // Concatenate the components in "ddmmyyyy" format
    var formattedDate = formattedDay + formattedMonth + year;

    return formattedDate;
};

module.exports = formatDate;
