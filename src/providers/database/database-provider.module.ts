import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigModule } from 'src/config/database/database-config.module';
import { DatabaseConfigService } from 'src/config/database/database-config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [DatabaseConfigModule],
      inject: [DatabaseConfigService],
      useFactory: async (databaseConfigService: DatabaseConfigService) => ({
        type: 'postgres',
        host: databaseConfigService.host,
        port: databaseConfigService.port,
        username: databaseConfigService.username,
        password: databaseConfigService.password,
        database: databaseConfigService.name,
        autoLoadEntities: true,
        synchronize: false,
        dropSchema: false,
      }),
    }),
  ],
})
export class DatabaseProviderModule {}
