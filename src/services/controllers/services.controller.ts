import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ServicesService } from '../services/services.service.js';
import { SlotsService } from '../services/slots.service.js';
import { GetSlotsQueryDto } from '../dto/get-slots-query.dto.js';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly slotsService: SlotsService,
  ) {}

  @Get()
  getServices() {
    return this.servicesService.getServices();
  }

  @Get(':id/slots')
  getSlots(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GetSlotsQueryDto,
  ) {
    return this.slotsService.getSlots(id, query);
  }
}
