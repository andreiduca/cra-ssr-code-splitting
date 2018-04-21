const initialState = {
    message: null,
};

export const appReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'SET_MESSAGE':
            return {
                ...state,
                message: action.message,
            };
        default:
            return state;
    }
};

export const setMessage = messageText => ({ type: 'SET_MESSAGE', message: messageText });

export const setAsyncMessage = messageText => dispatch => (
    new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 2000);
    })
        .then(() => dispatch(setMessage(messageText)))
);
