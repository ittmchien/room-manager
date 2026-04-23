import { Global, Module } from '@nestjs/common';
import { ConfigService as AppConfigService } from './config.service';

@Global()
@Module({
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
