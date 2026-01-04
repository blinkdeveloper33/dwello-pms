import { Controller, Get, Patch, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Request() req: any) {
    // TODO: Extract user ID from JWT token
    const userId = req.user?.id;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.profileService.getProfile(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @Request() req: any,
    @Body() body: { name?: string; email?: string }
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.profileService.updateProfile(userId, body);
  }

  @Post('image')
  @ApiOperation({ summary: 'Upload profile image' })
  async uploadImage(
    @Request() req: any,
    @Body() body: { image: string }
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.profileService.uploadImage(userId, body.image);
  }
}

