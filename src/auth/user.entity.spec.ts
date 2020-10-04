import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

describe('User entity', () => {
    let user;

    beforeEach(() => {
        user = new User();
        user.password = 'TestPassword';
        bcrypt.compare = jest.fn();
    });

    it('successfully validate password', async () => {
        bcrypt.compare.mockResolvedValue(true);
        expect(bcrypt.compare).not.toHaveBeenCalled();
        const result = await user.validatePassword('KeyinPassword');
        expect(bcrypt.compare).toHaveBeenCalledWith('KeyinPassword', user.password);
        expect(result).toEqual(true);
    });

    it('wrong password', async () => {
        bcrypt.compare.mockResolvedValue(false);
        const result = await user.validatePassword('KeyinPassword');
        expect(result).toEqual(false);
     });
});