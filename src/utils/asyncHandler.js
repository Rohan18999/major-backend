// so higher order function is used when you want to to check for errors in multiple functions, here asyncHandler is a higher order function
const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)) // here you can also use .then, means it succcessfully executed
        .catch((err) => next(err))
    }

    // here a promise variale holds the state and result of an asynchronous operation
    // it can be in one of three states: pending, fulfilled, or rejected
    // when the promise is fulfilled, it means the asynchronous operation completed successfully and the promise has a resolved value
    // when the promise is rejected, it means the asynchronous operation failed and the promise has a reason for the failure (usually an error object)
}

export {asyncHandler}

// (function) => {} => {} this is a higher order function
// this is used to handle errors in async functions in express js (same as try catch block)