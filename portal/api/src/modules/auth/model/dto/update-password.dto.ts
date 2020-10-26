import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @MinLength(5)
  otk!: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @MinLength(5)
  password!: string;

}
