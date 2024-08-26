import { z } from 'zod';

const sliderValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Titile is required.',
      invalid_type_error: 'Titile must be a string.',
    }),
  }),
});

export default sliderValidationSchema;
