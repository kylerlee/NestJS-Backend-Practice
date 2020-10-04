import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCredentialDto } from './dto/user-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService
    ) { }

    async signUp(userCredentialDto: UserCredentialDto): Promise<void> {
        return this.userRepository.signUp(userCredentialDto);
    }

    async signIn(userCredentialDto: UserCredentialDto): Promise<{ accessToken: string }> {
        const username = await this.userRepository.validateUserPassword(userCredentialDto);
        if (!username) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JwtPayload = { username };
        const accessToken = await this.jwtService.sign(payload);
        return { accessToken };
    }
}
