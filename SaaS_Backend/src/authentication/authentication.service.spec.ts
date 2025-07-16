
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService, AuthenticationError } from './authentication.service';
import { PrismaService } from '../prisma.service';
import { KeycloakAuthenticationStrategy } from './strategy/keycloak.strategy';
import { ConsoleLogger } from '@nestjs/common';
import { AuthenticationGuard } from './authentication.guard';
import { UserService } from '../user/user.service';


describe('OrganisationService', () => {
  let service: AuthenticationService;
  let prisma: Partial<PrismaService>
  let strategy:KeycloakAuthenticationStrategy
  // let fakePrisma :Partial<PrismaService>

  beforeEach(async () => {
    // fakePrisma={

    // }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        AuthenticationGuard,
        AuthenticationService,
        KeycloakAuthenticationStrategy,
        UserService
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    strategy=module.get<KeycloakAuthenticationStrategy>(KeycloakAuthenticationStrategy)
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('Returns succes token verification response',async()=>{
    strategy.authenticate=jest.fn().mockReturnValueOnce(Promise.resolve({sub:"uhdijihfkhjbjhbf",preferred_username:"bazigar"}));
    const result = await service.authenticate("sjncjsncjsnc","jshcjsbcn");
    expect(result).toEqual({ id: 'uhdijihfkhjbjhbf', username: 'bazigar' })

  })

//  it('Returns error token verification response',async()=>{
   
//     strategy.authenticate=jest.fn().mockRejectedValueOnce('error');
 
    
//     expect(strategy.authenticate).toEqual('error')

//   })


  

});



