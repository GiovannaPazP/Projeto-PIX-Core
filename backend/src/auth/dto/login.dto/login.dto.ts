//define estrutra e regras de validação dos dados
import { IsString, IsNotEmpty, Length } from "class-validator";
import { IsCPF } from "cpf-cnpj-validator/class-validator";

export class LoginDto {
    //decorator associa metadados/comportamentos a classes/metodos
    @IsString()         
    @IsNotEmpty()
    @IsCPF()
    @Length(11,11)
    cpf!: string; 

    @IsString()         
    @IsNotEmpty()
    pass!: string;
}
