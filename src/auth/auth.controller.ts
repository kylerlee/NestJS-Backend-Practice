import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserCredentialDto } from './dto/user-credentials.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Post('/signup')
    signUp(@Body(ValidationPipe) userCredentialDto: UserCredentialDto): Promise<void> {
        return this.authService.signUp(userCredentialDto);
    }

    @Post('/signin')
    signIn(@Body(ValidationPipe) userCredentialDto: UserCredentialDto): Promise<{ accessToken: string }> {
        return this.authService.signIn(userCredentialDto);
    }

}
