import { IsString, IsNotEmpty, Matches } from "class-validator";

export class TransferPixDto {
    
    @IsString()
    @IsNotEmpty()
    pixKeyReceiver!: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d+(\.\d{1,2})?$/) //padrão do número, até duas casas decimasi
    amount!: string;
}
