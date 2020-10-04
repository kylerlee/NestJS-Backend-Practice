import { User } from "./user.entity";
import { Test } from "@nestjs/testing";
import { UserRepository } from './user.repository';
import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';

const mockedUserRepository = () => ({
    findOne: jest.fn(),
});

const mockedPayload = { username: 'TestUsername' };

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                { provide: UserRepository, useFactory: mockedUserRepository },
            ],
        }).compile();

        jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
        userRepository = module.get<UserRepository>(UserRepository);
    });

    describe('validate', () => {
        it('validated and return the user', async () => {
            const user = new User();
            user.username = 'Testusername';

            userRepository.findOne.mockResolvedValue(user);
            expect(userRepository.findOne).not.toHaveBeenCalled();
            const result = await jwtStrategy.validate(mockedPayload);
            expect(userRepository.findOne).toHaveBeenCalledWith(mockedPayload);
            expect(result).toEqual(user);
        });

        it('validation failed and throw unauthorized exception', async () => {
            userRepository.findOne.mockResolvedValue(null);
            await expect(jwtStrategy.validate(mockedPayload)).rejects.toThrow(UnauthorizedException);
        });
    });
});