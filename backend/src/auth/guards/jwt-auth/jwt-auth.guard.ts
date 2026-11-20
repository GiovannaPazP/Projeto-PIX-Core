//verifica se a request tem permissão para acessar um endpoint
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService){}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    //separando o tipo do token da autorização
    const [type, token] = auth?.split(' ') ?? []; //se auth for null/undefined utiliza array vazio

    if(type !== 'Bearer' || !token){
      throw new UnauthorizedException();
    }

    //verificando o token
    try{
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload; //add os dados validados ao objeto da request
    } catch{
      throw new UnauthorizedException();
    }

    return true;
  }
}
