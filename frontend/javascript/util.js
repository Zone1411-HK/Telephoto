function date_yyyy_MM_dd(originDate) {
    const date = new Date(originDate);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month.toString().length == 1) {
        month = '0' + month.toString();
    }

    let day = date.getDate(date);
    if (day.toString().length == 1) {
        day = '0' + day.toString();
    }
    return `${year}-${month}-${day}`;
}
