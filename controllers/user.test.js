jest.mock('../models/user');
const User = require('../models/user');
const { follow } = require('./user');

describe('follow', () => {
    const req = {
        user: { id: 1 },
        params: { id: 2 },
    };
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();

    test('if user found, add following and reply success', async() => {
        User.findOne.mockReturnValue({
            addFollowing(id){
                return Promise.resolve(true);
            }
        });
        await follow(req, res, next);
        expect(res.send).toBeCalledWith('success');
    });

    test('if user not found, call res.status(404).send(no user)', async() => {
        User.findOne.mockReturnValue(null);
        await follow(req, res, next);
        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith('no user');
    });

    test('if database has error, call next(error)', async() => {
        const message = 'Database error';
        User.findOne.mockReturnValue(Promise.reject(message));
        await follow(req, res, next);
        expect(next).toBeCalledWith(message);
    });
});

//535