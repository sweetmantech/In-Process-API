import { z } from 'zod';
import addressSchema from './addressSchema';

const emailRecipientSchema = z.string().trim().toLowerCase().email();

const airdropRecipientSchema = z.union([addressSchema, emailRecipientSchema]);

export default airdropRecipientSchema;
