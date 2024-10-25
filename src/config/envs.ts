import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  APP_PORT: number;
  NATS_SERVERS: string[];
  JWT_SECRET: string;
  JWT_ISSUER: string;
  JWT_EXPIRES: string;
}

const envsSchema = joi
  .object({
    APP_PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    JWT_SECRET: joi.string().required(),
    JWT_ISSUER: joi.string().required(),
    JWT_EXPIRES: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
const envVars: EnvVars = value;

export const envs = {
  appPort: envVars.APP_PORT,
  natsServers: envVars.NATS_SERVERS,
  jwt: {
    secret: envVars.JWT_SECRET,
    issuer: envVars.JWT_ISSUER,
    expires: envVars.JWT_EXPIRES
  }
};
