import { Module } from '@nestjs/common';
import { ServicesController } from './controllers/services.controller.js';
import { ServicesService } from './services/services.service.js';
import { SlotsService } from './services/slots.service.js';
import { ServicesRepository } from './repositories/services.repository.js';
import { BookedSlotsRepository } from './repositories/booked-slots.repository.js';

@Module({
  controllers: [ServicesController],
  providers: [
    ServicesService,
    SlotsService,
    ServicesRepository,
    BookedSlotsRepository,
  ],
  exports: [ServicesService],
})
export class ServicesModule {}
