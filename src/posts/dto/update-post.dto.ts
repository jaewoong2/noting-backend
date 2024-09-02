import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @Type(() => String)
  @IsString()
  id: string = '';

  @Type(() => String)
  @IsString()
  @IsOptional()
  title?: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  is_public?: boolean;
}
