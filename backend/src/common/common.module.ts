import { Module, Global } from '@nestjs/common';
import { AccessControlService } from './services/access-control.service';

@Global() // Hace el servicio disponible en toda la aplicacion sin imports explicitos
@Module({
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class CommonModule {}
