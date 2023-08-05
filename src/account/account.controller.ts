import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards  } from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from './schema/account.schema';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

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
}
