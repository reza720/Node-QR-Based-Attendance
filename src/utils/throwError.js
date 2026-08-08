function throwError (message, code){
    const err = new Error(message);
    err.status = code;
    throw err;
};

export default throwError;