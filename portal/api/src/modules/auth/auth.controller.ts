import { Controller, Get, Render, Post, HttpStatus, Body, Req, HttpException, Res, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiResponse, ApiConsumes, ApiProduces, ApiOkResponse } from '@nestjs/swagger';
import { Roles } from '@common/decorators/roles.decorator';
import { User } from '@common/decorators/user.decorator';
import { MailService } from '@common/mail/mail.service';
import { LoginDto } from './model/dto/login.dto';
import { RegisterUserDto } from './model/dto/register-user.dto';
import { UpdateUserDto } from './model/dto/update-user.dto';
import { ConfigService } from '@common/config/config.service';
import * as i18n from 'i18n';
import { UpdatePasswordDto } from './model/dto/update-password.dto';
import { RememberDto } from './model/dto/remember-user.dto';
import { RefreshDto } from './model/dto/refresh.dto';
import { ResponseTokenDto } from './model/dto/response-token.dto';
import { UsersService } from './user.service';
import { ResponseUserDto } from './model/dto/response-user.dto';
import { AppModule } from '../../app.module';
import * as path from 'path';

@Controller('auth')
export class AuthController {

  private ATTACHMENTS = [
    {
        filename: 'eu-flag.jpg',
        path:  path.join(AppModule.staticAssetsDir, 'assets', 'images', 'flag_yellow_low-300x201.jpg'),
        cid: 'eu-flag.jpg',
    },
    {
      filename: 'bloomen-dev-portal.png',
      path:  path.join(AppModule.staticAssetsDir, 'assets', 'images', 'logo_bloomen.png'),
      cid: 'bloomen-dev-portal.png',
  },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    ) {}

  @Post('login')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Successful Login', type: ResponseTokenDto  })
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  async login(@Body() credentials: LoginDto): Promise<ResponseTokenDto> {
    const user = await this.userService.getByEmailAndPass(credentials.email, credentials.password);
    if (user) {
      return await this.authService.generateTokens(user);
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('token/refresh')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseTokenDto})
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @Roles('user')
  async refresh(@User('rjti') rjti: string, @Body() refreshTokenRequest: RefreshDto ): Promise<ResponseTokenDto> {
    return await this.authService.refreshTokens(rjti, refreshTokenRequest);
  }

  @Get('logout')
  @ApiBearerAuth()
  @Roles('user')
  async logout(@User('rjti') rjti: string): Promise<any> {
    return await this.authService.deleteTokens(rjti);
  }

  @Post('user/register')
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Successful Registration',
  })
  async register(@Req() req: Request, @Res() res: Response, @Body() payload: RegisterUserDto) {

    const userDb = await this.userService.getByEmail(payload.email);
    if (userDb) {
      res.status(HttpStatus.NOT_ACCEPTABLE).send('User already registered');
      return;
    }

    const user = await this.userService.create(payload);
    const lang = i18n.getLocale(req);
    const oneTimeToken = await this.authService.createOneTimeToken(user, lang);

    const msg =  {
      from: this.configService.get('MAIL_FROM'),
      to: oneTimeToken.email,
      subject: i18n.__({phrase: 'email_register_subject', locale: oneTimeToken.lang}),
      template: 'email_base',
        context: {
          template: 'register',
          locale: oneTimeToken.lang,
          firstName: oneTimeToken.firstName,
          lastName: oneTimeToken.lastName,
          oneTimeToken: this.configService.get('MAIL_CUSTOM_RESET_PASSWORD_URL') ?
          this.configService.get('MAIL_CUSTOM_RESET_PASSWORD_URL') + '?otk=' + oneTimeToken.id :
           req.protocol + '://' + req.get('host') + '/api/auth/password/reset' + '?otk=' + oneTimeToken.id,
        },
        attachments : this.ATTACHMENTS,
      };

    this.mailService.sendMail(msg);
    res.status(HttpStatus.ACCEPTED).send();
  }

  @Get('user/me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseUserDto})
  @Roles('user')
  async getUser(@User('id') userId: string): Promise<ResponseUserDto> {
    return await this.userService.get(Number(userId)) ;
  }

  @Post('user/update')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseUserDto})
  @Roles('user')
  async updateUser(@User('id') userId: string, @Body() payload: UpdateUserDto): Promise<ResponseUserDto> {
    return await this.userService.update(userId, payload);
  }

  @Post('user/remember')
  async remember(@Req() req: Request, @Res() res: Response, @Body() payload: RememberDto) {
    const user = await this.userService.getByEmail(payload.email);
    if (!user) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    const lang = i18n.getLocale(req);
    const oneTimeToken = await this.authService.createOneTimeToken(user, lang);

    if (!oneTimeToken) {
      res.status(HttpStatus.NOT_FOUND).send();
    }

    const msg =  {
      from: this.configService.get('MAIL_FROM'),
      to: oneTimeToken.email,
      subject: i18n.__({phrase: 'email_remember_subject', locale: oneTimeToken.lang}),
      template: 'email_base',
        context: {
          template: 'remember',
          locale: oneTimeToken.lang,
          firstName: oneTimeToken.firstName,
          lastName: oneTimeToken.lastName,
          oneTimeToken: this.configService.get('MAIL_CUSTOM_RESET_PASSWORD_URL') ?
          this.configService.get('MAIL_CUSTOM_RESET_PASSWORD_URL') + '?otk=' + oneTimeToken.id :
           req.protocol + '://' + req.get('host') + '/api/auth/password/reset' + '?otk=' + oneTimeToken.id,
        },
        attachments : this.ATTACHMENTS,
      };

    this.mailService.sendMail(msg);
    res.status(HttpStatus.ACCEPTED).send();
  }

  @Get('password/reset')
  @ApiProduces('text/html')
  @Render('views/resetPassword')
  async resetPassword(@Query('otk') oneTimeTokenId: string) {

    let otk = '';
    let status = false;
    let firstName = '';

    const oneTimeToken = await this.authService.getOneTimeToken(oneTimeTokenId);

    if (oneTimeToken) {
      otk = oneTimeTokenId;
      status = true;
      firstName = oneTimeToken.firstName;
    }

    return { status, otk, firstName };
  }

  @Post('password/update')
  @ApiProduces('text/html')
  @Render('views/resetPasswordConfirmation')
  async updatePassword(@Body() payload: UpdatePasswordDto) {
    const oneTimeToken = await this.authService.getOneTimeToken(payload.otk);
    let status = false;
    if (oneTimeToken) {
      await this.authService.deleteOneTimeToken(payload.otk);
      const user = await this.userService.updatePassword(oneTimeToken.userId, payload);
      status = true;
    }
    return {status};
  }

}
