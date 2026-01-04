import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() body: { email: string; password: string }): Promise<{ user?: any; memberships?: any[]; error?: string }> {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    const memberships = await this.authService.getUserMemberships(user.id);
    return { user, memberships };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@Request() req: any) {
    // TODO: Implement JWT guard
    return { user: req.user };
  }
}

