import { Test } from "@nestjs/testing";
import { UserRepository } from "./user.repository";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { User } from "./user.entity";
import * as bcrypt from 'bcryptjs';

const mockCredentialsDto = { username: "TestUserName", password: "TestPassword" };

describe('UserRepository', () => {
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [UserRepository],
        }).compile();

        userRepository = module.get<UserRepository>(UserRepository);
    })

    describe('signUp', () => {
        let save;

        beforeEach(() => {
            save = jest.fn();
            userRepository.create = jest.fn().mockReturnValue({ save });
        });

        it('successfully signs up a new user', async () => {
            save.mockResolvedValue(undefined);
            await expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
        });

        it('throws a conflict exception for existing user', async () => {
            save.mockRejectedValue({ code: '23505' });
            await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(ConflictException);
        });

        it('throws 500 server error', async () => {
            save.mockRejectedValue({ code: '12343125' });
            await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('validateUserPassword', () => {
        let user;

        beforeEach(() => {
            userRepository.findOne = jest.fn();
            user = new User();
            user.username = 'TestUsername';
            user.validatePassword = jest.fn();
        });


        it('successfully validate and return username', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(true);
            expect(userRepository.findOne).not.toHaveBeenCalled();
            expect(user.validatePassword).not.toHaveBeenCalled();
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(userRepository.findOne).toHaveBeenCalled();
            expect(user.validatePassword).toHaveBeenCalled();
            expect(result).toEqual(user.username);
        });

        it('no user found', async () => {
            userRepository.findOne.mockResolvedValue(null);
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(result).toBeNull();
        });

        it('user found but wrong password', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(false);
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(result).toBeNull();
        });
    });

    describe('hashPassword', () => {
        it('return a hashed password', async () => {
            bcrypt.hash = jest.fn().mockResolvedValue('TestPassword');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await userRepository.hashPassword('TestPassord', 8);
            expect(bcrypt.hash).toHaveBeenCalledWith('TestPassord', 8);
            expect(result).toEqual('TestPassword');
        });
    });
});