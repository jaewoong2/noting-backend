import { NestFactory } from '@nestjs/core';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';

let cachedServer: any;

export const bootstrapLambda = async (
  attachPipes: (app: INestApplication<any>) => void,
) => {
  if (!cachedServer) {
    // create an express app
    const expressApp = express();

    // create an express adapter to work with nest applicaiton
    const expressAdapter = new ExpressAdapter(expressApp);

    // create a nest app using the express adapter
    const nestApp = await NestFactory.create(AppModule, expressAdapter, {});

    nestApp.enableCors();

    // configure nest application
    attachPipes(nestApp);

    // wait for the nest to initialise
    await nestApp.init();

    // create a serverless server using serverless express
    cachedServer = serverlessExpress({
      app: expressApp,
    });

    return cachedServer;
  }

  return cachedServer;
};
