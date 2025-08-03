module.exports = async () => {
    // Принудительное завершение через 5 секунд
    const timeout = setTimeout(() => {
        console.log('Forcing test process exit');
        process.exit(0);
    }, 5000);

    // Очистка
    process.on('exit', () => {
        clearTimeout(timeout);
        console.log('Test process cleaned up');
    });
};
