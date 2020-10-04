import { Repository, EntityRepository } from "typeorm";
import { User } from "./user.entity";
import { UserCredentialDto } from './dto/user-credentials.dto';
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from 'bcryptjs';

@EntityRepository(User)
export class UserRepository extends Repository<User>{
    async signUp(userCredentialDto: UserCredentialDto): Promise<void> {
        const { username, password } = userCredentialDto;

        const user = this.create();
        user.username = username;
        user.password = await this.hashPassword(password, 8);

        try {
            await user.save();
        }
        catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Username already exists');
            }
            else {
                throw new InternalServerErrorException();
            }
        }
    }

    async validateUserPassword(userCredentialDto: UserCredentialDto): Promise<string> {
        const { username, password } = userCredentialDto;
        const user = await this.findOne({ username });
        if (user && await user.validatePassword(password)) {
            return user.username;
        }
        else {
            return null;
        }
    }

    private async hashPassword(password: string, round: number): Promise<string> {
        return bcrypt.hash(password, round);
    }

}