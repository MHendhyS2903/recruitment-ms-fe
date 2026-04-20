/** `true` di bundle production (`npm run build`, Vercel). `false` saat `npm start` dan di test. */
export const isProductionBuild = (): boolean => process.env.NODE_ENV === 'production';
