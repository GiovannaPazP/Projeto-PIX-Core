import { Test, TestingModule } from '@nestjs/testing';
import { PixController } from './pix.controller.js';

describe('PixController', () => {
  let controller: PixController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PixController],
    }).compile();

    controller = module.get<PixController>(PixController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
