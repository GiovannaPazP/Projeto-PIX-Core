import { IsString, IsNotEmpty, ValidateIf, IsIn } from "class-validator";

export class CreatePixKeyDto {

    @IsIn(['CPF', 'EMAIL', 'ALEATORIA'])
    keyType!: string;

    @ValidateIf((obj) => obj.keyType !== 'ALEATORIA')
    @IsString()
    @IsNotEmpty()
    keyValue?: string;
}
