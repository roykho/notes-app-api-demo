const errorHandler = (err, req, res) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    res.status(statusCode);
    res.json({
        message: err.message,
        stack: err.stack,
    });
};

export default errorHandler;
