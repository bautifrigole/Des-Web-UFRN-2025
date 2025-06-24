function timeGenerator() {
    const today = new Date();
    const mm = today.getMonth() + 1;
    const dd = today.getDate();
    const yy = today.getFullYear();
    const time = today.toLocaleTimeString('es-AR');

    const now = yy + '-' + mm + '-' + dd + " " + time;

    return { now, today: today.toString() }
}

module.exports = timeGenerator;
