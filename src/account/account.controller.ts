import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards  } from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from './schema/account.schema';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '@nestjs/passport';


@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @UseGuards(AuthGuard())
  @Get('me')
  async getCurrentUser(@Req() req): Promise<Account> {
    return this.accountService.findByUser(req.user._id);
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<Account> {
    return this.accountService.findByUser(id)
  }

  @Put(':id')
  async updateAccount(@Param('id') id: string, @Body() account: UpdateAccountDto): Promise<Account> {
    return this.accountService.updateByUser(id, account)
  }

  @Delete(':id')
  async deleteListing(@Param('id') id: string): Promise<Account> {
    return this.accountService.deleteByUser(id)
  }

  @Put(':userId/favorite/:listingId')
  async toggleFavoriteListing(@Param('userId') userId: string, @Param('listingId') listingId: string): Promise<Account> {
  return await this.accountService.toggleFavoriteListing(userId, listingId);
}


}
